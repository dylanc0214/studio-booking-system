import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { startOfDay, endOfDay, addHours, isWithinInterval } from 'date-fns';
import { sendAdminNotification } from '../lib/email.ts';

const HOURLY_RATE = 50; // $50 per hour

async function isDateBlocked(tx: any, date: Date): Promise<boolean> {
    const mytDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    const mytStartUTC = new Date(Date.UTC(mytDate.getUTCFullYear(), mytDate.getUTCMonth(), mytDate.getUTCDate()));
    mytStartUTC.setUTCHours(-8, 0, 0, 0);
    const mytEndUTC = new Date(mytStartUTC.getTime() + 24 * 60 * 60 * 1000);

    const block = await tx.dateBlock.findFirst({
        where: {
            date: {
                gte: mytStartUTC,
                lt: mytEndUTC
            }
        }
    });

    return !!block;
}

export const getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const dateStr = req.query.date as string;
        const durationStr = req.query.duration as string;
        const duration = durationStr ? parseInt(durationStr, 10) : 1;

        if (!dateStr || (duration !== 1 && duration !== 2)) {
            res.status(400).json({ error: 'Valid date (YYYY-MM-DD) and duration (1 or 2) are required' });
            return;
        }

        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        const day = parseInt(dayStr, 10);

        const dateUTC = new Date(Date.UTC(year, month, day));

        // Malaysia Time is UTC+8
        // 12 PM MYT = 04:00 UTC
        // 7 PM MYT = 11:00 UTC
        const windowStart = new Date(dateUTC);
        windowStart.setUTCHours(4, 0, 0, 0);

        const windowEnd = new Date(dateUTC);
        windowEnd.setUTCHours(11, 0, 0, 0);

        // Check if the date is blocked by admin
        const isBlocked = await isDateBlocked(prisma, dateUTC);

        if (isBlocked) {
            res.json({ availableSlots: [] });
            return;
        }

        // Fetch confirmed or pending bookings within the window bounds
        const existingBookings = await prisma.booking.findMany({
            where: {
                start_time: { lt: windowEnd }, // Must start before our window ends
                end_time: { gt: windowStart }, // Must end after our window starts
                status: { in: ['CONFIRMED', 'PENDING'] },
            },
        });

        // Generate all possible slots from 12 PM to 7 PM MYT (04:00 to 11:00 UTC)
        const availableSlots = [];

        for (let hourUTC = 4; hourUTC <= 11 - duration; hourUTC++) {
            const slotStart = new Date(dateUTC);
            slotStart.setUTCHours(hourUTC, 0, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setUTCHours(hourUTC + duration, 0, 0, 0);

            // For the requested duration, we must ensure that AT NO POINT does the overlapping count exceed 2.
            // We check the overlap count for each hour of the requested duration and take the maximum.
            let maxOverlapCount = 0;

            for (let i = 0; i < duration; i++) {
                const hourStart = new Date(slotStart.getTime() + i * 60 * 60 * 1000);
                const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

                let currentHourOverlapCount = 0;
                existingBookings.forEach((b) => {
                    if (hourStart < b.end_time && hourEnd > b.start_time) {
                        currentHourOverlapCount++;
                    }
                });

                if (currentHourOverlapCount > maxOverlapCount) {
                    maxOverlapCount = currentHourOverlapCount;
                }
            }

            // Check if the slot is in the past
            // slotStart is in UTC. Let's compare against current UTC time.
            const nowUTC = new Date();
            const isPast = slotStart < nowUTC;

            if (maxOverlapCount < 3 && !isPast) {
                availableSlots.push({ start: slotStart, end: slotEnd, availableCount: 3 - maxOverlapCount });
            }
        }

        res.json({ availableSlots });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { start_time, duration } = req.body; // duration in hours: 1 or 2
        const userId = req.user?.id;

        if (!userId || !start_time || !duration) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (duration !== 1 && duration !== 2) {
            res.status(400).json({ error: 'Duration must be 1 or 2 hours' });
            return;
        }

        const start = new Date(start_time);
        const end = addHours(start, duration);

        if (await isDateBlocked(prisma, start)) {
            res.status(400).json({ error: 'This date is currently blocked for holidays/maintenance' });
            return;
        }

        // Check availability again to be safe
        const overlappingCount = await prisma.booking.count({
            where: {
                status: { in: ['CONFIRMED', 'PENDING'] },
                OR: [
                    { start_time: { lt: end }, end_time: { gt: start } }
                ]
            }
        });

        if (overlappingCount >= 3) {
            res.status(400).json({ error: 'Time slot is no longer available' });
            return;
        }

        const total_price = duration * HOURLY_RATE;

        const booking = await prisma.booking.create({
            data: {
                user_id: userId,
                start_time: start,
                end_time: end,
                duration,
                total_price,
                status: 'PENDING',
            }
        });

        res.status(201).json({ booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { start_time, duration, payment_method, receipt_url } = req.body;
        const userId = req.user?.id;

        if (!userId || !start_time || !duration || !payment_method || !receipt_url) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (duration !== 1 && duration !== 2) {
            res.status(400).json({ error: 'Duration must be 1 or 2 hours' });
            return;
        }

        const validMethods = ['TNG', 'BANK_TRANSFER'];
        if (!validMethods.includes(payment_method)) {
            res.status(400).json({ error: 'Invalid payment method' });
            return;
        }

        const start = new Date(start_time);
        const end = addHours(start, duration);
        const total_price = duration * HOURLY_RATE;

        // Perform atomic check and insert
        const result = await prisma.$transaction(async (tx) => {
            if (await isDateBlocked(tx, start)) {
                throw new Error('This date is currently blocked for holidays/maintenance');
            }

            // Concurrency Check: Ensure no overlapping confirmed or pending bookings exceed capacity
            const overlappingCount = await tx.booking.count({
                where: {
                    status: { in: ['CONFIRMED', 'PENDING'] },
                    OR: [
                        { start_time: { lt: end }, end_time: { gt: start } }
                    ]
                }
            });

            if (overlappingCount >= 3) {
                throw new Error('Time slot is no longer available');
            }

            // Create Booking
            const booking = await tx.booking.create({
                data: {
                    user_id: userId,
                    start_time: start,
                    end_time: end,
                    duration,
                    total_price,
                    status: 'PENDING',
                },
                include: { user: { select: { name: true } } }
            });

            // Create Payment
            const transactionId = `txn_${Math.random().toString(36).substring(2, 10)}`;
            const payment = await tx.payment.create({
                data: {
                    booking_id: booking.id,
                    amount: total_price,
                    payment_status: 'PENDING',
                    payment_method: payment_method as any,
                    receipt_url: receipt_url,
                    transaction_id: transactionId,
                }
            });

            return { booking, payment };
        });

        // Send notification to admin asynchronously
        sendAdminNotification(result.booking, payment_method, receipt_url)
            .catch(err => console.error('Failed to send admin notification', err));

        res.json({ success: true, payment: result.payment, booking: result.booking });
    } catch (error: any) {
        if (error.message === 'Time slot is no longer available' || error.message === 'This date is currently blocked for holidays/maintenance') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to process checkout' });
        }
    }
};
