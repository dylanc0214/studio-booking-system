import { Router } from 'express';
import { getAvailability, createBooking, checkout } from '../controllers/bookingController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.get('/availability', getAvailability);
router.post('/bookings', authenticate, createBooking);
router.post('/checkout', authenticate, checkout);

export default router;
