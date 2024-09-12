const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define your routes
router.get('/', authController.showHomePage);
router.get('/login', authController.showLoginPage);
router.post('/login', authController.processLogin);
router.get('/signup', authController.showSignupPage);
router.post('/signup', authController.processSignup);
router.get('/forgot-password', authController.showForgotPasswordPage);
router.post('/forgot-password', authController.processForgotPassword);
router.get('/reset-password/:token', authController.showResetPasswordPage);
router.post('/reset-password/:token', authController.processResetPassword);
router.get('/logout', authController.logout);

module.exports = router;