const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect the dashboard route with authentication middleware
router.get('/', authMiddleware.isAuthenticated, dashboardController.showDashboard);

module.exports = router;