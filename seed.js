/**
 * Seed script — creates admin user(s) in MongoDB from STAFF_EMAILS
 * 
 * Usage:
 *   1. Set STAFF_EMAILS and ADMIN_PASSWORD in .env
 *   2. Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function seed() {
    const staffEmails = (process.env.STAFF_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const password = process.env.ADMIN_PASSWORD;

    if (staffEmails.length === 0 || !password) {
        console.error('Error: Set STAFF_EMAILS and ADMIN_PASSWORD in .env');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Error: Password must be at least 8 characters.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const email of staffEmails) {
            const existing = await Admin.findOne({ email: { $eq: email } });
            if (existing) {
                console.log(`Admin "${email}" already exists. Updating password...`);
                existing.password = password;
                existing.loginAttempts = 0;
                existing.lockUntil = null;
                await existing.save();
                console.log('Password updated.');
            } else {
                await Admin.create({ email, password });
                console.log(`Admin "${email}" created.`);
            }
        }
    } catch (err) {
        console.error('Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

seed();
