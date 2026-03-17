import nodemailer from 'nodemailer';

// Use environment variables for SMTP configuration
// Fallbacks are provided to prevent crashes if not set, but emails will fail if invalid.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

const fromEmail = process.env.SMTP_FROM || '"DJ Studio" <noreply@example.com>';

export const sendBookingUpdateNotification = async (
    userEmail: string,
    userName: string,
    status: 'CONFIRMED' | 'CANCELLED',
    bookingDetails: { start_time: Date, duration: number }
) => {
    try {
        if (!process.env.SMTP_HOST) {
            console.warn(`[Email Service] SMTP not configured. Would have sent ${status} email to ${userEmail}.`);
            return;
        }

        const subject = status === 'CONFIRMED'
            ? 'Your Booking has been Confirmed'
            : 'Your Booking has been Cancelled';

        const dateStr = new Date(bookingDetails.start_time).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });

        const html = `
            <h2>Booking ${status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}</h2>
            <p>Hi ${userName},</p>
            <p>Your booking for <strong>${dateStr}</strong> (${bookingDetails.duration} hour(s)) has been <strong>${status.toLowerCase()}</strong> by the administrator.</p>
            ${status === 'CONFIRMED' ? '<p>We look forward to seeing you!</p>' : '<p>If you have any questions, please contact us.</p>'}
            <p>Best regards,<br>DJ Studio Team</p>
        `;

        const info = await transporter.sendMail({
            from: fromEmail,
            to: userEmail,
            subject,
            html,
        });

        console.log(`Email sent to ${userEmail}: ${info.messageId}`);
    } catch (error) {
        console.error('Error sending booking update notification:', error);
    }
};

export const sendAdminNotification = async (
    bookingDetails: { id: number, start_time: Date, duration: number, user_id: number, user?: { name: string | null } },
    paymentMethod: string,
    receiptUrl: string | null
) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail || !process.env.SMTP_HOST) {
            console.warn(`[Email Service] SMTP or Admin Email not configured. Would have sent admin notification for booking ${bookingDetails.id}.`);
            return;
        }

        const dateStr = new Date(bookingDetails.start_time).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });
        const userNameDisplay = bookingDetails.user?.name || `User ID ${bookingDetails.user_id}`;

        const html = `
            <h2>New Booking Action Required</h2>
            <p>A new booking has been submitted with proof of payment.</p>
            <ul>
                <li><strong>Booking ID:</strong> ${bookingDetails.id}</li>
                <li><strong>User:</strong> ${userNameDisplay}</li>
                <li><strong>Date/Time:</strong> ${dateStr}</li>
                <li><strong>Duration:</strong> ${bookingDetails.duration} hour(s)</li>
                <li><strong>Payment Method:</strong> ${paymentMethod}</li>
                ${receiptUrl ? `<li><strong>Receipt:</strong> <a href="${receiptUrl}">View Receipt</a></li>` : ''}
            </ul>
            <p>Please review and approve or reject this booking in the Admin Dashboard.</p>
        `;

        const info = await transporter.sendMail({
            from: fromEmail,
            to: adminEmail,
            subject: `Action Required: New Booking #${bookingDetails.id} Pending Approval`,
            html,
        });

        console.log(`Admin notification sent to ${adminEmail}: ${info.messageId}`);
    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
};
