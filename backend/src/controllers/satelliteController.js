const SatelliteService = require('../services/satelliteService');
const Farm = require('../models/Farm');
const catchAsync = require('../utils/catchAsync');

exports.getSatelliteDataForFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findById(req.params.farmId);
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      farmId: farm._id,
      imagery: farm.satelliteImagery
    }
  });
});

exports.requestNewImagery = catchAsync(async (req, res, next) => {
  const farm = await Farm.findById(req.params.farmId);
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  // Calculate date range (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Format dates for API
  const formatDate = date => date.toISOString().split('T')[0];
  
  try {
    const imageryData = await SatelliteService.getNDVIForFarm(
      req.params.farmId,
      formatDate(startDate),
      formatDate(endDate)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        farmId: req.params.farmId,
        period: `${formatDate(startDate)} to ${formatDate(endDate)}`,
        imageryCount: imageryData ? imageryData.length : 0,
        imageryData: imageryData || []
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve satellite imagery: ' + error.message
    });
  }
});