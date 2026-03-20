require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const projectRoutes = require('./routes/projects');
const { requireAuth } = require('./middleware/auth');

const app = express();

// --- Security headers ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        }
    }
}));

// --- Body parsing & cookies ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- MongoDB connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);

// --- Page Routes ---

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin panel (protected)
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// All projects page
app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});

// Individual project page
app.get('/project/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'project.html'));
});

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname), {
    index: 'index.html',
    extensions: ['html']
}));

// --- Port fallback logic ---
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const FALLBACK_TRIES = parseInt(process.env.PORT_FALLBACK_TRIES, 10) || 10;

function tryListen(port, attempt) {
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < FALLBACK_TRIES) {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            server.close();
            tryListen(port + 1, attempt + 1);
        } else {
            console.error(`Could not find an open port after ${FALLBACK_TRIES} attempts.`);
            process.exit(1);
        }
    });
}

tryListen(BASE_PORT, 0);
