const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

module.exports = { isAuthenticated }; 