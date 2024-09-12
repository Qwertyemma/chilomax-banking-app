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
    res.render('home', { title: 'Home' });
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
    console.log('Received signup data:', req.body);
    ({ firstName, lastName, username, email, password, confirmPassword } = trimInputs({ firstName, lastName, username, email, password, confirmPassword }));

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        console.log('Signup validation failed: missing fields');
        return res.redirect('/signup?error=All fields are required.');
    }

    if (password !== confirmPassword) {
        console.log('Signup validation failed: passwords do not match');
        return res.redirect('/signup?error=Passwords do not match.');
    }

    try {
        const existingUser = await User.findOne({ email });
        console.log('Checking if email already exists:', email);

        if (existingUser) {
            console.log('Signup failed: Email is already in use');
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

        console.log('User created successfully:', newUser);
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
    console.log('Login attempt:', req.body);
    ({ email, password } = trimInputs({ email, password }));

    try {
        const user = await User.findOne({ email });
        console.log('User found for login:', user);

        if (!user) {
            console.log('Login failed: User not found');
            return res.redirect('/login?error=Invalid email or password.');
        }

        // Compare password with the hashed one in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Login failed: Password mismatch');
            return res.redirect('/login?error=Invalid email or password.');
        }

        // Set session data after successfully authenticated
        req.session.isAuthenticated = true;
        req.session.user = user;

        console.log('Login successful for:', email);
        console.log('Redirecting to dashboard');
        res.render('dashboard', { title: 'Dashboard', username: req.session.username });
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
        console.log('Processing forgot password for user:', user);

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
                console.log('Error sending email:', err);
                return res.redirect('/forgot-password?error=Error sending email. Please try again later.');
            }
            console.log('Password reset email sent successfully');
            res.redirect('/forgot-password?message=Check your email for the reset link.');
        });
    } catch (err) {
        console.error('Forgot password error:', err);
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
            console.log('Reset token invalid or expired');
            return res.render('reset-password', { title: 'Reset Password', error: 'Password reset token is invalid or has expired.', token: null, message: null });
        }

        res.render('reset-password', { title: 'Reset Password', token, error: null, message: null });
    } catch (err) {
        console.error('Error in showing reset password page:', err);
        res.render('reset-password', { title: 'Reset Password', error: 'An error occurred. Please try again later.', token: null, message: null });
    }
};

// Handle reset password logic
exports.processResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        console.log('Reset password failed: Passwords do not match');
        return res.render('reset-password', { title: 'Reset Password', error: 'Passwords do not match.', token, message: null });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Reset password token is invalid or expired');
            return res.render('reset-password', { title: 'Reset Password', error: 'Password reset token is invalid or has expired.', token, message: null });
        }

        // Update the password directly
        user.password = await bcrypt.hash(password, 10); // Hash new password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        console.log('Password changed successfully for user:', user);
        res.render('reset-password', { title: 'Reset Password', message: 'Password changed successfully. You can now log in with your new password.', token: null, error: null });
    } catch (err) {
        console.error('Error in processing reset password:', err);
        res.render('reset-password', { title: 'Reset Password', error: 'An error occurred. Please try again later.', token, message: null });
    }
};

// Render dashboard page
exports.showDashboard = (req, res) => {
    if (!req.session.user) {
        console.log('No user session found. Redirecting to login');
        return res.redirect('/login');
    }
    console.log('Rendering dashboard for user:', req.session.user.username);
    res.render('dashboard', { title: 'Dashboard', username: req.session.user.username });
};

// Logout user
exports.logout = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        console.log('Logging out user:', req.session.user._id);
        await User.findByIdAndDelete(req.session.user._id);

        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/dashboard');
            }
            res.clearCookie('connect.sid', { path: '/' });
            console.log('Logout successful. Redirecting to login');
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.redirect('/dashboard?error=Error occurred while logging out. Please try again.');
    }
};
