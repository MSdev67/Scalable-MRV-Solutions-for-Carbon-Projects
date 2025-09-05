const express = require('express');
const carbonController = require('../controllers/carbonController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/farm/:farmId', carbonController.getCarbonDataForFarm);
router.post('/calculate/:farmId', carbonController.calculateCarbonCredits);
router.get('/verification-status/:farmId', carbonController.getVerificationStatus);

// Restrict to verifier and admin for verification routes
router.use(authController.restrictTo('verifier', 'admin'));

router.post('/verify/:farmId', carbonController.verifyCarbonCredits);
router.get('/pending-verification', carbonController.getPendingVerifications);

module.exports = router;