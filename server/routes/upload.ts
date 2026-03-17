import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage });

router.post('/', authenticate, upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path so the frontend can submit it to checkout
    const receiptUrl = `/uploads/${req.file.filename}`;
    res.json({ receiptUrl });
});

export default router;
