const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security middleware
app.use(helmet());

// Regular middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./src/routes/auth');
const farmRoutes = require('./src/routes/farms');
const carbonRoutes = require('./src/routes/carbon');
const satelliteRoutes = require('./src/routes/satellite');
const verificationRoutes = require('./src/routes/verification');
const weatherRoutes = require('./src/routes/weather');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/weather', weatherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'MRV Solutions API Documentation',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/signup': 'Create new user',
        'GET /api/auth/me': 'Get current user (protected)'
      },
      farms: {
        'GET /api/farms': 'Get all farms for user',
        'POST /api/farms': 'Create new farm',
        'GET /api/farms/:id': 'Get farm by ID',
        'PATCH /api/farms/:id': 'Update farm',
        'DELETE /api/farms/:id': 'Delete farm'
      },
      carbon: {
        'GET /api/carbon/farm/:farmId': 'Get carbon data for farm',
        'POST /api/carbon/calculate/:farmId': 'Calculate carbon credits',
        'POST /api/carbon/verify/:farmId': 'Verify carbon credits',
        'GET /api/carbon/pending-verification': 'Get pending verifications'
      },
      satellite: {
        'GET /api/satellite/farm/:farmId': 'Get satellite data for farm',
        'POST /api/satellite/request-imagery/:farmId': 'Request new imagery'
      },
      verification: {
        'GET /api/verification': 'Get all verifications',
        'GET /api/verification/:id': 'Get verification by ID',
        'POST /api/verification/:farmId/period/:period': 'Create verification',
        'PATCH /api/verification/:id': 'Update verification'
      },
      weather: {
        'GET /api/weather/farm/:farmId': 'Get weather data for farm'
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;