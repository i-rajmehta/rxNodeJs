const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer TOKEN'

    if (!token) return res.status(401).json({ message: 'Token required.' });

    // Verify JWT token
    jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
