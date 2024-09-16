const User = require('../../models/User');

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admins only.' });
};