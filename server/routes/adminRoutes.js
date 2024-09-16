const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Apply middleware to protect all admin routes
router.use(isAuthenticated);  // Ensure the user is authenticated
router.use(isAdmin);  // Ensure the user has admin privileges

// Admin dashboard route
router.get('/admindashboard', adminController.dashboard);

// Admin confirms bank transfer
router.post('/confirm-transfer', adminController.confirmBankTransfer);

// Get pending transfers for the admin dashboard
router.get('/pending-transfers', adminController.getPendingTransfers);

module.exports = router;