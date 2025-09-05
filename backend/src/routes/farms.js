const express = require('express');
const farmController = require('../controllers/farmController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(farmController.getAllFarms)
  .post(authController.restrictTo('farmer', 'admin'), farmController.createFarm);

router
  .route('/:id')
  .get(farmController.getFarm)
  .patch(authController.restrictTo('farmer', 'admin'), farmController.updateFarm)
  .delete(authController.restrictTo('farmer', 'admin'), farmController.deleteFarm);

router.get('/stats/farm-stats', farmController.getFarmStats);
router.get('/farms-within/:distance/center/:latlng/unit/:unit', farmController.getFarmsWithin);

module.exports = router;