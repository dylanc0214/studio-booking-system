import { Router } from 'express';
import { register, login, getUserProfile, googleLogin } from '../controllers/authController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticate, getUserProfile);

export default router;
