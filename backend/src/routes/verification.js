const express = require('express');
const verificationController = require('../controllers/verificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/farm/:farmId', verificationController.getVerificationsForFarm);
router.get('/:id', verificationController.getVerification);

// Restrict to verifier and admin for verification routes
router.use(authController.restrictTo('verifier', 'admin'));

router.post('/:farmId/period/:period', verificationController.createVerification);
router.patch('/:id', verificationController.updateVerification);
router.get('/', verificationController.getAllVerifications);

module.exports = router;