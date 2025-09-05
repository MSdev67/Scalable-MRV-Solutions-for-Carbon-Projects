const Farm = require('../models/Farm');
const CarbonCalculator = require('../services/carbonCalculation');
const catchAsync = require('../utils/catchAsync');

exports.getCarbonDataForFarm = catchAsync(async (req, res, next) => {
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
      periods: farm.carbonCredits,
      totalCredits: farm.carbonCredits.reduce((sum, period) => sum + (period.verifiedCredits || 0), 0)
    }
  });
});

exports.calculateCarbonCredits = catchAsync(async (req, res, next) => {
  const farm = await Farm.findById(req.params.farmId);
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  // Determine the period (default to current quarter)
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const period = `${year}-Q${quarter}`;
  
  // Check if calculation already exists for this period
  const existingCalculation = farm.carbonCredits.find(c => c.period === period);
  
  if (existingCalculation && existingCalculation.status !== 'rejected') {
    return res.status(400).json({
      status: 'fail',
      message: `Carbon credits for period ${period} have already been calculated`
    });
  }
  
  // Calculate carbon credits
  const calculatedCredits = CarbonCalculator.calculateCredits(farm, period);
  
  // Validate for verification
  const validation = CarbonCalculator.validateForVerification(farm, period);
  
  // Create or update carbon credit record
  const carbonCreditData = {
    period,
    calculatedCredits,
    verifiedCredits: 0,
    status: validation.isValid ? 'pending' : 'requires_data',
    verificationDate: null,
    verifierId: null
  };
  
  if (existingCalculation) {
    // Update existing
    await Farm.updateOne(
      { _id: req.params.farmId, 'carbonCredits.period': period },
      { $set: { 'carbonCredits.$': carbonCreditData } }
    );
  } else {
    // Add new
    await Farm.updateOne(
      { _id: req.params.farmId },
      { $push: { carbonCredits: carbonCreditData } }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      calculatedCredits,
      methodology: farm.cropType === 'rice' ? 'rice_AWD' : 'agroforestry_standard',
      validation
    }
  });
});

exports.verifyCarbonCredits = catchAsync(async (req, res, next) => {
  const { period, status, verifiedCredits, notes } = req.body;
  
  const farm = await Farm.findById(req.params.farmId);
  
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  const creditIndex = farm.carbonCredits.findIndex(c => c.period === period);
  
  if (creditIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: `No carbon credit calculation found for period ${period}`
    });
  }
  
  // Update verification status
  const updateData = {
    'carbonCredits.$.status': status,
    'carbonCredits.$.verificationDate': new Date(),
    'carbonCredits.$.verifierId': req.user.id
  };
  
  if (verifiedCredits !== undefined) {
    updateData['carbonCredits.$.verifiedCredits'] = verifiedCredits;
  }
  
  if (notes) {
    updateData['carbonCredits.$.notes'] = notes;
  }
  
  await Farm.updateOne(
    { _id: req.params.farmId, 'carbonCredits.period': period },
    { $set: updateData }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      status,
      verifiedCredits: verifiedCredits || farm.carbonCredits[creditIndex].calculatedCredits,
      verifiedBy: req.user.id,
      verificationDate: new Date()
    }
  });
});

exports.getVerificationStatus = catchAsync(async (req, res, next) => {
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
      verifications: farm.carbonCredits.map(credit => ({
        period: credit.period,
        status: credit.status,
        calculatedCredits: credit.calculatedCredits,
        verifiedCredits: credit.verifiedCredits,
        verificationDate: credit.verificationDate,
        verifierId: credit.verifierId
      }))
    }
  });
});

exports.getPendingVerifications = catchAsync(async (req, res, next) => {
  const farms = await Farm.find({
    'carbonCredits.status': 'pending'
  }).populate('farmerId', 'name email');
  
  const pendingVerifications = [];
  
  farms.forEach(farm => {
    farm.carbonCredits.forEach(credit => {
      if (credit.status === 'pending') {
        pendingVerifications.push({
          farmId: farm._id,
          farmName: farm.name,
          farmerName: farm.farmerId.name,
          period: credit.period,
          calculatedCredits: credit.calculatedCredits,
          cropType: farm.cropType
        });
      }
    });
  });
  
  res.status(200).json({
    status: 'success',
    results: pendingVerifications.length,
    data: {
      verifications: pendingVerifications
    }
  });
});