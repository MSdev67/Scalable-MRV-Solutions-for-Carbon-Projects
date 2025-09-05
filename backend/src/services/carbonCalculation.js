const RiceCarbonCalculator = require('./riceCarbonCalculator');
const AgroforestryCarbonCalculator = require('./agroforestryCarbonCalculator');

class CarbonCalculator {
  static calculateCredits(farm, period) {
    try {
      let credits = 0;
      
      switch (farm.cropType) {
        case 'rice':
          credits = RiceCarbonCalculator.calculate(farm, period);
          break;
        case 'agroforestry':
          credits = AgroforestryCarbonCalculator.calculate(farm, period);
          break;
        case 'mixed':
          const riceCredits = RiceCarbonCalculator.calculate(farm, period);
          const agroforestryCredits = AgroforestryCarbonCalculator.calculate(farm, period);
          credits = riceCredits + agroforestryCredits;
          break;
        default:
          throw new Error(`Unsupported crop type: ${farm.cropType}`);
      }
      
      return Math.max(0, credits);
    } catch (error) {
      console.error('Error in carbon calculation:', error);
      throw new Error('Failed to calculate carbon credits');
    }
  }
  
  static validateForVerification(farm, period) {
    const validation = {
      isValid: true,
      issues: [],
    };
    
    // Check if farm has sufficient ground truth data
    const periodData = farm.groundTruthData.filter(
      data => new Date(data.date).toISOString().substring(0, 7) === period.substring(0, 7)
    );
    
    if (periodData.length === 0) {
      validation.isValid = false;
      validation.issues.push('No ground truth data for the specified period');
    }
    
    // Check if satellite imagery is available
    const periodImagery = farm.satelliteImagery.filter(
      img => new Date(img.date).toISOString().substring(0, 7) === period.substring(0, 7)
    );
    
    if (periodImagery.length === 0) {
      validation.isValid = false;
      validation.issues.push('No satellite imagery for the specified period');
    }
    
    // Check if cloud cover is acceptable for at least one image
    const clearImagery = periodImagery.filter(img => img.cloudCover < 0.3);
    if (clearImagery.length === 0) {
      validation.issues.push('All satellite imagery has high cloud cover (>30%)');
      // Note: This doesn't make it invalid, just flags an issue
    }
    
    return validation;
  }
}

module.exports = CarbonCalculator;