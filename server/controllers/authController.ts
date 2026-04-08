import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.ts';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
            },
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential, access_token } = req.body;

        let email, name, picture;

        if (credential) {
            // Verify the token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                return res.status(400).json({ error: 'Invalid Google token payload' });
            }

            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else if (access_token) {
            // Fetch user info using the access token
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            const userInfo = await userInfoRes.json();

            if (!userInfo || !userInfo.email) {
                return res.status(400).json({ error: 'Invalid Google user info' });
            }

            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
        } else {
            return res.status(400).json({ error: 'Missing Google credential or access_token' });
        }

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create user (Google auth users don't need a real password initially)
            const randomPassword = Math.random().toString(36).slice(-8);
            const password_hash = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    name: name || 'Google User',
                    email,
                    password_hash,
                }
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, picture } });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ error: 'Google Login failed' });
    }
};

export const getUserProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { bookings: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};
