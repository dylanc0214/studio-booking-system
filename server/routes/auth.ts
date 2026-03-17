import { Router } from 'express';
import { register, login, getUserProfile, googleLogin } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticate, getUserProfile);

export default router;
