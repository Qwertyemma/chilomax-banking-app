// Render dashboard page
exports.showDashboard = (req, res) => {
    // Log to check if the function is being called
    console.log('showDashboard function called');

    // Log the session data to see if the username is present
    console.log('Session data:', req.session);

    // Log the username being passed to the template
    console.log('Username:', req.session.username);

    // Render the dashboard page
    res.render('dashboard', { title: 'Dashboard', username: req.session.username });
};
