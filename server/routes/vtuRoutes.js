const express = require('express');
const router = express.Router();
const vtuController = require('../controllers/vtuController');

// Routes for buying data and airtime
router.post('/buy-data', vtuController.buyData);
router.post('/buy-airtime', vtuController.buyAirtime);

module.exports = router;