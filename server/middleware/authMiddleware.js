exports.isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next(); // User is authenticated, continue
    }
    res.redirect('/login'); // If not authenticated, redirect to login
};