const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware.isAuthenticated, dashboardController.showDashboard);

module.exports = router;