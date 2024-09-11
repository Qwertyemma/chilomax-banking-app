const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes for home page, login, signup, forgot password
router.get('/', authController.showHomePage);
router.get('/login', authController.showLoginPage);
router.post('/login', authController.processLogin);

router.get('/signup', authController.showSignupPage);
router.post('/signup', authController.processSignup);

router.get('/forgot-password', authController.showForgotPasswordPage);
router.post('/forgot-password', authController.processForgotPassword);



// Show reset password page and process reset password
router.get('/reset-password/:token', authController.showResetPasswordPage);
router.post('/reset-password/:token', authController.processResetPassword);

// Logout
router.get('/logout', authController.logout);

module.exports = router;