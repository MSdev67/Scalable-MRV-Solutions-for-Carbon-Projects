const axios = require('axios');
const Farm = require('../models/Farm');

class SatelliteService {
  constructor() {
    this.planetApiKey = process.env.PLANET_API_KEY;
    this.sentinelHubApiKey = process.env.SENTINELHUB_API_KEY;
  }
  
  async getNDVIForFarm(farmId, startDate, endDate) {
    try {
      const farm = await Farm.findById(farmId);
      if (!farm) {
        throw new Error('Farm not found');
      }
      
      const { coordinates } = farm.location;
      const geometry = {
        type: 'Point',
        coordinates: coordinates,
      };
      
      // Try Planet Labs first
      let ndviData = await this.getPlanetNDVI(geometry, startDate, endDate);
      
      // Fallback to Sentinel Hub if Planet fails
      if (!ndviData) {
        ndviData = await this.getSentinelHubNDVI(geometry, startDate, endDate);
      }
      
      // Store the retrieved data
      if (ndviData && ndviData.length > 0) {
        for (const dataPoint of ndviData) {
          await Farm.updateOne(
            { _id: farmId },
            {
              $push: {
                satelliteImagery: {
                  date: dataPoint.date,
                  source: dataPoint.source,
                  cloudCover: dataPoint.cloudCover,
                  vegetationIndex: dataPoint.ndvi,
                  url: dataPoint.url,
                },
              },
            }
          );
        }
      }
      
      return ndviData;
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      throw new Error('Failed to retrieve satellite data');
    }
  }
  
  async getPlanetNDVI(geometry, startDate, endDate) {
    // Implementation for Planet Labs API
    // This would make actual API calls to Planet's services
    try {
      const response = await axios.get(
        `https://api.planet.com/data/v1/item-types/PSScene4Band/items`,
        {
          headers: { Authorization: `api-key ${this.planetApiKey}` },
          params: {
            geometry: JSON.stringify(geometry),
            date_range: `${startDate}/${endDate}`,
            cloud_cover: 'lt.0.3', // Less than 30% cloud cover
          },
        }
      );
      
      // Process response and calculate NDVI
      return this.processPlanetResponse(response.data);
    } catch (error) {
      console.error('Planet API error:', error);
      return null;
    }
  }
  
  async getSentinelHubNDVI(geometry, startDate, endDate) {
    // Implementation for Sentinel Hub API
    try {
      const evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08", "CLM"],
            output: { bands: 3 }
          };
        }
        
        function evaluatePixel(sample) {
          // Calculate NDVI
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          
          // Return RGB values, using NDVI for color mapping
          return [ndvi, sample.CLM, 0.5];
        }
      `;
      
      const response = await axios.post(
        'https://services.sentinel-hub.com/api/v1/process',
        {
          input: {
            bounds: {
              geometry: geometry,
            },
            data: [
              {
                dataFilter: {
                  timeRange: {
                    from: startDate,
                    to: endDate,
                  },
                },
                type: 'sentinel-2-l2a',
              },
            ],
          },
          evalscript: evalscript,
          output: {
            width: 512,
            height: 512,
            responses: [
              {
                identifier: 'default',
                format: {
                  type: 'image/png',
                },
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.sentinelHubApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return this.processSentinelResponse(response.data);
    } catch (error) {
      console.error('Sentinel Hub API error:', error);
      return null;
    }
  }
  
  processPlanetResponse(data) {
    // Process and extract NDVI values from Planet response
    // This is a simplified implementation
    return data.features.map(feature => ({
      date: feature.properties.acquired,
      source: 'planet',
      cloudCover: feature.properties.cloud_cover,
      ndvi: this.calculateNDVI(
        feature.properties.band_4, // NIR
        feature.properties.band_3  // Red
      ),
      url: feature._links.thumbnail,
    }));
  }
  
  processSentinelResponse(data) {
    // Process Sentinel Hub response
    // This would extract and calculate NDVI values
    return []; // Placeholder
  }
  
  calculateNDVI(nir, red) {
    return (nir - red) / (nir + red);
  }
}

module.exports = new SatelliteService();