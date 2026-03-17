import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendBookingUpdateNotification } from '../lib/email'; // Placeholder if we ever want to trigger real emails later

export const getPendingBookings = async (req: Request, res: Response) => {
    try {
        // Current time
        const now = new Date();

        // Convert to Malaysia Time equivalent parts
        // MYT is UTC+8
        const mytDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);

        // Construct a UTC date that represents midnight in MYT
        // Example: If it's May 5th in MYT, we want the boundary to be May 4th 16:00:00 UTC
        const todayStartUTC = new Date(Date.UTC(
            mytDate.getUTCFullYear(),
            mytDate.getUTCMonth(),
            mytDate.getUTCDate()
        ));

        // Adjust back 8 hours to get the exact UTC time that corresponds to 00:00:00 MYT
        todayStartUTC.setUTCHours(-8, 0, 0, 0);

        const bookings = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                start_time: {
                    gte: todayStartUTC
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                payment: true
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        res.json({ bookings });
    } catch (error) {
        console.error('Error fetching pending bookings:', error);
        res.status(500).json({ error: 'Failed to fetch pending bookings' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || (status !== 'CONFIRMED' && status !== 'CANCELLED')) {
            return res.status(400).json({ error: 'Invalid ID or status. Status must be CONFIRMED or CANCELLED' });
        }

        const bookingId = parseInt(id, 10);

        // Perform an atomic update to sync booking and payment statuses
        const result = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.update({
                where: { id: bookingId },
                data: { status },
                include: { user: true }
            });

            const paymentStatus = status === 'CONFIRMED' ? 'COMPLETED' : 'FAILED';

            await tx.payment.update({
                where: { booking_id: bookingId },
                data: { payment_status: paymentStatus }
            });

            return booking;
        });

        if (result.user && result.user.email) {
            // Send email notification asynchronously
            sendBookingUpdateNotification(
                result.user.email,
                result.user.name || 'User',
                status as 'CONFIRMED' | 'CANCELLED',
                { start_time: result.start_time, duration: result.duration }
            ).catch(err => console.error('Failed to send status update email', err));
        }

        res.json({ success: true, booking: result });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [usersCount, pendingBookingsCount, confirmedBookingsCount, revenueAgg] = await Promise.all([
            prisma.user.count(),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.booking.count({ where: { status: 'CONFIRMED' } }),
            prisma.booking.aggregate({
                where: { status: 'CONFIRMED' },
                _sum: { total_price: true }
            })
        ]);

        res.json({
            totalUsers: usersCount,
            pendingBookings: pendingBookingsCount,
            confirmedBookings: confirmedBookingsCount,
            totalRevenue: revenueAgg._sum.total_price || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_banned: true,
                created_at: true,
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const toggleUserBan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_banned } = req.body;

        if (!id || typeof is_banned !== 'boolean') {
            return res.status(400).json({ error: 'Invalid ID or ban status' });
        }

        const userId = parseInt(id, 10);

        // Cannot ban another admin
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ error: 'Cannot ban an admin user' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { is_banned }
        });

        res.json({ success: true, user: { id: updatedUser.id, is_banned: updatedUser.is_banned } });
    } catch (error) {
        console.error('Error toggling user ban:', error);
        res.status(500).json({ error: 'Failed to toggle user ban' });
    }
};

export const getUpcomingBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                start_time: {
                    gte: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                payment: true
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        res.json({ bookings });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming bookings' });
    }
};

export const updateBookingTime = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { start_time } = req.body;

        if (!id || !start_time) {
            return res.status(400).json({ error: 'Invalid ID or start_time' });
        }

        const bookingId = parseInt(id, 10);
        const newStart = new Date(start_time);

        // Fetch the booking to get duration
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const newEnd = new Date(newStart.getTime() + booking.duration * 60 * 60 * 1000);

        // Concurrency Check: Ensure no overlapping confirmed or pending bookings
        const overlapping = await prisma.booking.findFirst({
            where: {
                id: { not: bookingId }, // Exclude self
                status: { in: ['CONFIRMED', 'PENDING'] },
                OR: [
                    { start_time: { lt: newEnd }, end_time: { gt: newStart } }
                ]
            }
        });

        if (overlapping) {
            return res.status(400).json({ error: 'Time slot is no longer available' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                start_time: newStart,
                end_time: newEnd
            }
        });

        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking time:', error);
        res.status(500).json({ error: 'Failed to update booking time' });
    }
};

export const getHolidays = async (req: Request, res: Response) => {
    try {
        const holidays = await prisma.dateBlock.findMany({
            orderBy: { date: 'asc' }
        });
        res.json({ holidays });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
};

export const addHoliday = async (req: Request, res: Response) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const dateObj = new Date(date);

        const newBlock = await prisma.dateBlock.create({
            data: {
                date: dateObj,
                reason: reason || null
            }
        });

        res.json({ success: true, holiday: newBlock });
    } catch (error: any) {
        console.error('Error adding holiday:', error);
        // unique constraint check
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'This date is already blocked.' });
        }
        res.status(500).json({ error: 'Failed to add holiday' });
    }
};

export const deleteHoliday = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const blockId = parseInt(id, 10);

        await prisma.dateBlock.delete({
            where: { id: blockId }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(500).json({ error: 'Failed to delete holiday' });
    }
};

