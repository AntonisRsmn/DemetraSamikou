const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');

const MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5;
const LOCK_MINUTES = parseInt(process.env.LOCK_MINUTES, 10) || 15;
const LOCK_TIME_MS = LOCK_MINUTES * 60 * 1000;

function getStaffEmails() {
    const raw = process.env.STAFF_EMAILS || '';
    return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

function ttlToMs(ttl) {
    const match = (ttl || '15m').match(/^(\d+)(m|h|d)$/);
    if (!match) return 15 * 60 * 1000;
    const val = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'm') return val * 60 * 1000;
    if (unit === 'h') return val * 60 * 60 * 1000;
    if (unit === 'd') return val * 24 * 60 * 60 * 1000;
    return 15 * 60 * 1000;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input.' });
        }

        if (email.length > 100 || password.length > 128) {
            return res.status(400).json({ message: 'Invalid input.' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if this email is in the staff list
        const staffEmails = getStaffEmails();
        if (!staffEmails.includes(normalizedEmail)) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const admin = await Admin.findOne({ email: { $eq: normalizedEmail } });
        const genericError = 'Invalid email or password.';

        if (!admin) {
            return res.status(401).json({ message: genericError });
        }

        if (admin.isLocked()) {
            const remainingMs = admin.lockUntil - Date.now();
            const remainingSec = Math.ceil(remainingMs / 1000);
            const remainingMin = Math.ceil(remainingSec / 60);
            return res.status(429).json({
                message: `Account locked. Try again in ${remainingMin} minute(s).`,
                retryAfter: remainingSec
            });
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            admin.loginAttempts += 1;

            if (admin.loginAttempts >= MAX_ATTEMPTS) {
                admin.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                admin.loginAttempts = 0;
                await admin.save();
                return res.status(429).json({
                    message: `Account locked. Try again in ${LOCK_MINUTES} minutes.`,
                    retryAfter: LOCK_TIME_MS / 1000
                });
            }

            await admin.save();
            const remaining = MAX_ATTEMPTS - admin.loginAttempts;
            return res.status(401).json({
                message: `${genericError} ${remaining} attempt(s) remaining.`
            });
        }

        admin.loginAttempts = 0;
        admin.lockUntil = null;
        await admin.save();

        const tokenTTL = process.env.JWT_ACCESS_TTL || '15m';
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: tokenTTL }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: process.env.COOKIE_SAMESITE || 'lax',
            maxAge: ttlToMs(tokenTTL)
        });

        res.json({ message: 'Login successful.', redirect: '/admin' });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out.', redirect: '/' });
});

// GET /api/auth/check
router.get('/check', (req, res) => {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ authenticated: true, email: decoded.email });
    } catch {
        res.clearCookie('token');
        return res.json({ authenticated: false });
    }
});

module.exports = router;
