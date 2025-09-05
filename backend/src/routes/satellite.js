const express = require('express');
const satelliteController = require('../controllers/satelliteController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/farm/:farmId', satelliteController.getSatelliteDataForFarm);
router.post('/request-imagery/:farmId', satelliteController.requestNewImagery);

module.exports = router;