import { Router } from 'express';
import { getAvailability, createBooking, checkout } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/availability', getAvailability);
router.post('/bookings', authenticate, createBooking);
router.post('/checkout', authenticate, checkout);

export default router;
