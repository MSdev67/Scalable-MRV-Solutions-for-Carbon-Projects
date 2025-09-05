const Farm = require('../models/Farm');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllFarms = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Farm.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const farms = await features.query.populate('farmerId', 'name email phone');
  
  res.status(200).json({
    status: 'success',
    results: farms.length,
    data: {
      farms
    }
  });
});

exports.getFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findById(req.params.id).populate('farmerId', 'name email phone');
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      farm
    }
  });
});

exports.createFarm = catchAsync(async (req, res, next) => {
  // Add the current user as the farmer
  req.body.farmerId = req.user.id;
  
  const newFarm = await Farm.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      farm: newFarm
    }
  });
});

exports.updateFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      farm
    }
  });
});

exports.deleteFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getFarmStats = catchAsync(async (req, res, next) => {
  const stats = await Farm.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$cropType',
        numFarms: { $sum: 1 },
        totalArea: { $sum: '$area' },
        avgArea: { $avg: '$area' },
        minArea: { $min: '$area' },
        maxArea: { $max: '$area' }
      }
    },
    {
      $sort: { totalArea: -1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getFarmsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
  if (!lat || !lng) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide latitude and longitude in the format lat,lng'
    });
  }
  
  const farms = await Farm.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });
  
  res.status(200).json({
    status: 'success',
    results: farms.length,
    data: {
      farms
    }
  });
});