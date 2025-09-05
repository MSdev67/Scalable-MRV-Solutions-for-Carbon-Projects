const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const FarmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true, // in hectares
  },
  location: {
    type: PointSchema,
    required: true,
    index: '2dsphere',
  },
  cropType: {
    type: String,
    enum: ['rice', 'agroforestry', 'mixed'],
    required: true,
  },
  practices: {
    type: [String],
    enum: [
      'alternateWettingDrying',
      'compostApplication',
      'coverCropping',
      'reducedTillage',
      'treeIntegration'
    ],
    default: [],
  },
  establishmentDate: {
    type: Date,
    required: true,
  },
  satelliteImagery: [{
    date: Date,
    source: String,
    cloudCover: Number,
    vegetationIndex: Number,
    url: String,
  }],
  groundTruthData: [{
    date: Date,
    collectedBy: String, // farmer or verifier ID
    treeCount: Number,
    treeSpecies: [String],
    soilOrganicCarbon: Number,
    images: [String], // URLs of uploaded images
    notes: String,
  }],
  carbonCredits: [{
    period: String, // e.g., "2023-Q2"
    calculatedCredits: Number,
    verifiedCredits: Number,
    verificationDate: Date,
    verifierId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'issued'],
      default: 'pending',
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for geospatial queries
FarmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);