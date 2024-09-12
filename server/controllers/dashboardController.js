exports.showDashboard = (req, res) => {
    res.render('dashboard', { title: 'Dashboard', username: req.session.user.username });
};