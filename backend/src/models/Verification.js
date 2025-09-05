const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  verifierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'requires_changes'],
    default: 'pending'
  },
  verificationDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'satellite', 'ground_truth']
    },
    url: String,
    description: String,
    timestamp: Date
  }],
  carbonCreditsAwarded: {
    type: Number,
    default: 0
  },
  rejectionReason: String,
  requiresAction: Boolean,
  actionItems: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Verification', VerificationSchema);