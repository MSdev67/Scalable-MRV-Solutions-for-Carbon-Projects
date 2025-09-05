const Verification = require('../models/Verification');
const Farm = require('../models/Farm');
const catchAsync = require('../utils/catchAsync');

exports.getVerificationsForFarm = catchAsync(async (req, res, next) => {
  const verifications = await Verification.find({ farmId: req.params.farmId })
    .populate('verifierId', 'name email')
    .sort({ verificationDate: -1 });
  
  res.status(200).json({
    status: 'success',
    results: verifications.length,
    data: {
      verifications
    }
  });
});

exports.getVerification = catchAsync(async (req, res, next) => {
  const verification = await Verification.findById(req.params.id)
    .populate('verifierId', 'name email')
    .populate('farmId', 'name area cropType');
  
  if (!verification) {
    return res.status(404).json({
      status: 'fail',
      message: 'No verification found with that ID'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      verification
    }
  });
});

exports.createVerification = catchAsync(async (req, res, next) => {
  const { farmId, period } = req.params;
  
  // Check if farm exists
  const farm = await Farm.findById(farmId);
  if (!farm) {
    return res.status(404).json({
      status: 'fail',
      message: 'No farm found with that ID'
    });
  }
  
  // Check if verification already exists for this period
  const existingVerification = await Verification.findOne({
    farmId,
    period
  });
  
  if (existingVerification) {
    return res.status(400).json({
      status: 'fail',
      message: `Verification already exists for period ${period}`
    });
  }
  
  // Create new verification
  const verification = await Verification.create({
    farmId,
    verifierId: req.user.id,
    period,
    status: 'pending'
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      verification
    }
  });
});

exports.updateVerification = catchAsync(async (req, res, next) => {
  const { status, notes, carbonCreditsAwarded, evidence } = req.body;
  
  const verification = await Verification.findByIdAndUpdate(
    req.params.id,
    {
      status,
      notes,
      carbonCreditsAwarded,
      $push: evidence ? { evidence: { $each: evidence } } : {}
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!verification) {
    return res.status(404).json({
      status: 'fail',
      message: 'No verification found with that ID'
    });
  }
  
  // If verification is approved, update the farm's carbon credits
  if (status === 'approved' && carbonCreditsAwarded) {
    await Farm.updateOne(
      { _id: verification.farmId, 'carbonCredits.period': verification.period },
      {
        $set: {
          'carbonCredits.$.verifiedCredits': carbonCreditsAwarded,
          'carbonCredits.$.status': 'verified',
          'carbonCredits.$.verificationDate': new Date(),
          'carbonCredits.$.verifierId': req.user.id
        }
      }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      verification
    }
  });
});

exports.getAllVerifications = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const query = status ? { status } : {};
  
  const verifications = await Verification.find(query)
    .populate('verifierId', 'name email')
    .populate('farmId', 'name area cropType farmerId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Verification.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: verifications.length,
    data: {
      verifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});