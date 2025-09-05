class RiceCarbonCalculator {
  static calculate(farm, period) {
    // Get data for the specified period
    const periodData = farm.groundTruthData.filter(
      data => new Date(data.date).toISOString().substring(0, 7) === period.substring(0, 7)
    );
    
    if (periodData.length === 0) {
      throw new Error(`No ground truth data available for period ${period}`);
    }
    
    // Calculate baseline emissions (conventional practices)
    const baselineEmission = this.calculateBaselineEmission(farm.area);
    
    // Calculate project emissions based on implemented practices
    const projectEmission = this.calculateProjectEmission(farm, periodData);
    
    // Calculate emission reduction
    const emissionReduction = baselineEmission - projectEmission;
    
    // Convert to carbon credits (1 credit = 1 ton CO2 equivalent)
    return Math.max(0, emissionReduction);
  }
  
  static calculateBaselineEmission(area) {
    // IPCC default values for rice cultivation emissions
    // These values should be calibrated for local conditions
    const baselineEmissionFactor = 3.2; // kg CH4/ha/day
    const cultivationPeriod = 120; // days
    const globalWarmingPotential = 28; // CH4 GWP over 100 years
    
    return area * baselineEmissionFactor * cultivationPeriod * globalWarmingPotential / 1000; // tons CO2eq
  }
  
  static calculateProjectEmission(farm, periodData) {
    let emissionFactor = 3.2; // Default baseline
    
    // Adjust emission factor based on practices
    if (farm.practices.includes('alternateWettingDrying')) {
      emissionFactor *= 0.5; // 50% reduction with AWD
    }
    
    if (farm.practices.includes('compostApplication')) {
      emissionFactor *= 0.8; // 20% reduction with compost
    }
    
    // Use actual measurements if available
    const latestData = periodData[periodData.length - 1];
    if (latestData.soilOrganicCarbon) {
      // Empirical relationship between SOC and methane emissions
      emissionFactor *= Math.max(0.5, 1 - (latestData.soilOrganicCarbon - 1) * 0.2);
    }
    
    const cultivationPeriod = 120; // days
    const globalWarmingPotential = 28; // CH4 GWP over 100 years
    
    return farm.area * emissionFactor * cultivationPeriod * globalWarmingPotential / 1000; // tons CO2eq
  }
}

module.exports = RiceCarbonCalculator;