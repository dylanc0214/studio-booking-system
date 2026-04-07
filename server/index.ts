import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Static files for Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('PORT:', process.env.PORT || '5000 (default)');
});
