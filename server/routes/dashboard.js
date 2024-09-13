const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard
router.get('/', authMiddleware.isAuthenticated, dashboardController.showDashboard);

// Buy Data
router.get('/buy-data', authMiddleware.isAuthenticated, dashboardController.showBuyDataPage);
router.post('/buy-data', authMiddleware.isAuthenticated, dashboardController.processBuyData);

// Buy Airtime
router.get('/buy-airtime', authMiddleware.isAuthenticated, dashboardController.showBuyAirtimePage);
router.post('/buy-airtime', authMiddleware.isAuthenticated, dashboardController.processBuyAirtime);

// Profile
router.get('/profile', authMiddleware.isAuthenticated, dashboardController.showProfilePage);
router.post('/update-profile', authMiddleware.isAuthenticated, dashboardController.updateProfile);

// Transactions
router.get('/transactions', authMiddleware.isAuthenticated, dashboardController.showTransactions);
router.get('/transaction-details/:id', authMiddleware.isAuthenticated, dashboardController.showTransactionDetails);
router.get('/fund-account', authMiddleware.isAuthenticated, dashboardController.showFundAccount);
router.post('/fund-account', authMiddleware.isAuthenticated, dashboardController.processFundAccount);

module.exports = router;