const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const token = req.cookies && req.cookies.token;

    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        // Token expired or invalid — clear cookie
        res.clearCookie('token');
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        return res.redirect('/login');
    }
}

module.exports = { requireAuth };
