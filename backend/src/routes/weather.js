const express = require('express');
const axios = require('axios');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/farm/:farmId', async (req, res) => {
  try {
    const Farm = require('../models/Farm');
    const farm = await Farm.findById(req.params.farmId);
    
    if (!farm) {
      return res.status(404).json({
        status: 'fail',
        message: 'No farm found with that ID'
      });
    }
    
    const { coordinates } = farm.location;
    const [lat, lng] = coordinates;
    
    // Using Open-Meteo API (free weather API)
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast`,
      {
        params: {
          latitude: lat,
          longitude: lng,
          current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
          timezone: 'auto',
          past_days: 7
        }
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        farmId: farm._id,
        location: { lat, lng },
        current: weatherResponse.data.current,
        daily: weatherResponse.data.daily
      }
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch weather data'
    });
  }
});

module.exports = router;