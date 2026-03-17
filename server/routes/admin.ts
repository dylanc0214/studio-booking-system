import { Router } from 'express';
import { getPendingBookings, updateBookingStatus, getDashboardStats, getUsers, toggleUserBan, getUpcomingBookings, updateBookingTime, getHolidays, addHoliday, deleteHoliday } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard-stats', getDashboardStats);

router.get('/bookings/upcoming', getUpcomingBookings);
router.get('/bookings/pending', getPendingBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/time', updateBookingTime);

router.get('/users', getUsers);
router.put('/users/:id/ban', toggleUserBan);

router.get('/holidays', getHolidays);
router.post('/holidays', addHoliday);
router.delete('/holidays/:id', deleteHoliday);

export default router;
