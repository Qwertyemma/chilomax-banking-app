const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../../models/User');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to trim user inputs
const trimInputs = (inputs) => {
    Object.keys(inputs).forEach(key => {
        if (typeof inputs[key] === 'string') {
            inputs[key] = inputs[key].trim();
        }
    });
    return inputs;
};

// Render home page
exports.showHomePage = (req, res) => {
    // Check if user is logged in and has a session
    const username = req.session.user ? req.session.user.username : 'Guest'; // Use 'Guest' if the user is not logged in
    res.render('home', { title: 'Welcome to Chilomax Bank', username });
};

// Render signup page
exports.showSignupPage = (req, res) => {
    res.render('signup', { title: 'Signup', error: req.query.error || null });
};

// Render login page
exports.showLoginPage = (req, res) => {
    res.render('login', { title: 'Login', error: req.query.error || null });
};

// Process signup
exports.processSignup = async (req, res) => {
    let { firstName, lastName, username, email, password, confirmPassword } = req.body;

    // Trim inputs
    ({ firstName, lastName, username, email, password, confirmPassword } = trimInputs({ firstName, lastName, username, email, password, confirmPassword }));

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        return res.redirect('/signup?error=All fields are required.');
    }

    if (password !== confirmPassword) {
        return res.redirect('/signup?error=Passwords do not match.');
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.redirect('/signup?error=Email is already in use.');
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword // store hashed password
        });
        await newUser.save();

        console.log('User created successfully.');
        res.redirect('/login');
    } catch (err) {
        console.error('Signup error:', err);
        res.redirect('/signup?error=An error occurred. Please try again later.');
    }
};

// Process login
exports.processLogin = async (req, res) => {
    let { email, password } = req.body;

    // Trim inputs
    ({ email, password } = trimInputs({ email, password }));

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.redirect('/login?error=Invalid email or password.');
        }

        // Compare password with the hashed one in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.redirect('/login?error=Invalid email or password.');
        }

        // Set session data after successfully authenticated
        req.session.isAuthenticated = true;
        req.session.user = user;

        console.log('Login successful for:', email);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login error:', err);
        res.redirect('/login?error=An error occurred. Please try again later.');
    }
};

// Render forgot password page
exports.showForgotPasswordPage = (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password', error: req.query.error || null, message: req.query.message || null });
};

// Handle forgot password logic
exports.processForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.redirect('/forgot-password?error=No account found with that email.');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `Click the link below to reset your password:\n\n${resetUrl}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.redirect('/forgot-password?error=Error sending email. Please try again later.');
            }
            res.redirect('/forgot-password?message=Check your email for the reset link.');
        });
    } catch (err) {
        res.redirect('/forgot-password?error=An error occurred. Please try again later.');
    }
};

// Render reset password page
exports.showResetPasswordPage = async (req, res) => {
    const { token } = req.params;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-password', { title: 'Reset Password', error: 'Password reset token is invalid or has expired.', token: null, message: null });
        }

        res.render('reset-password', { title: 'Reset Password', token, error: null, message: null });
    } catch (err) {
        res.render('reset-password', { title: 'Reset Password', error: 'An error occurred. Please try again later.', token: null, message: null });
    }
};

// Handle reset password logic
exports.processResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('reset-password', { title: 'Reset Password', error: 'Passwords do not match.', token, message: null });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-password', { title: 'Reset Password', error: 'Password reset token is invalid or has expired.', token, message: null });
        }

        // Update the password directly
        user.password = await bcrypt.hash(password, 10); // Hash new password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.render('reset-password', { title: 'Reset Password', message: 'Password changed successfully. You can now log in with your new password.', token: null, error: null });
    } catch (err) {
        res.render('reset-password', { title: 'Reset Password', error: 'An error occurred. Please try again later.', token, message: null });
    }
};

exports.logout = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        // Find and delete the user from the database
        await User.findByIdAndDelete(req.session.user._id);
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/dashboard'); // Redirect to a safe page if an error occurs
            }
            // Clear the session cookie
            res.clearCookie('connect.sid', { path: '/' });
            // Redirect to login page
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.redirect('/dashboard'); // Redirect to a safe page if an error occurs
    }
};