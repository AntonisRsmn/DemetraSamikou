const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const SiteSettings = require('../models/SiteSettings');

// Simple in-memory rate limiter (per IP, max 5 submissions per 15 min)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry) {
        rateLimitMap.set(ip, { count: 1, firstAttempt: now });
        return true;
    }
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, firstAttempt: now });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

// Cleanup old rate limit entries every 30 min
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
        if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
    }
}, 30 * 60 * 1000);

// Create transporter dynamically from saved credentials
async function getTransporter() {
    const settings = await SiteSettings.get();
    const user = settings.smtpUser || process.env.SMTP_USER;
    const pass = settings.smtpPass || process.env.SMTP_PASS;
    return { transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    }), smtpUser: user };
}

// POST /api/contact — receive contact form submission
router.post('/', async (req, res) => {
    try {
        // Rate limit check
        const clientIp = req.ip;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({ message: 'Too many messages. Please try again later.' });
        }

        const { name, email, service, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        // Save to database
        const contact = await Contact.create({
            name: name.substring(0, 200),
            email: email.substring(0, 200),
            service: (service || '').substring(0, 100),
            message: message.substring(0, 5000)
        });

        // Send email notification
        const { transporter, smtpUser } = await getTransporter();
        const settings = await SiteSettings.get();
        const staffEmail = settings.notificationEmail || process.env.STAFF_EMAILS || smtpUser;
        const serviceLabel = service || 'Not specified';

        const mailOptions = {
            from: `"Portfolio Contact" <${smtpUser}>`,
            to: staffEmail,
            replyTo: email,
            subject: `New Contact: ${name} — ${serviceLabel}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <table style="border-collapse:collapse;width:100%;max-width:500px;">
                    <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
                    <tr><td style="padding:8px;font-weight:bold;">Service</td><td style="padding:8px;">${escapeHtml(serviceLabel)}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${escapeHtml(message)}</td></tr>
                </table>
                <p style="color:#888;margin-top:16px;">Sent from your portfolio contact form</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact form error:', err.message);
        console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});

// HTML escape helper to prevent XSS in email content
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, c => map[c]);
}

module.exports = router;
