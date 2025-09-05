class AgroforestryCarbonCalculator {
  static calculate(farm, period) {
    // Get data for the specified period
    const periodData = farm.groundTruthData.filter(
      data => new Date(data.date).toISOString().substring(0, 7) === period.substring(0, 7)
    );
    
    if (periodData.length === 0) {
      throw new Error(`No ground truth data available for period ${period}`);
    }
    
    const latestData = periodData[periodData.length - 1];
    
    // Calculate carbon sequestration from trees
    const treeCarbon = this.calculateTreeCarbon(latestData.treeCount, latestData.treeSpecies, farm.establishmentDate);
    
    // Calculate soil carbon increase
    const soilCarbon = this.calculateSoilCarbon(farm, latestData);
    
    return treeCarbon + soilCarbon;
  }
  
  static calculateTreeCarbon(treeCount, treeSpecies, establishmentDate) {
    if (!treeCount || treeCount === 0) return 0;
    
    // Average carbon sequestration per tree per year (kg CO2)
    // Values vary by species, age, and growing conditions
    const averageCarbonPerTree = 22; // kg CO2 per year per tree
    
    // Calculate tree age in years
    const establishmentYear = new Date(establishmentDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const treeAge = Math.max(1, currentYear - establishmentYear);
    
    // Apply species-specific factors if available
    let speciesFactor = 1.0;
    if (treeSpecies && treeSpecies.length > 0) {
      speciesFactor = this.getSpeciesFactor(treeSpecies);
    }
    
    // Maturity factor (trees sequester more as they grow)
    const maturityFactor = Math.min(1.0, treeAge / 10);
    
    return treeCount * averageCarbonPerTree * treeAge * speciesFactor * maturityFactor / 1000; // tons CO2
  }
  
  static getSpeciesFactor(treeSpecies) {
    // Species-specific carbon sequestration factors
    const speciesFactors = {
      'teak': 1.2,
      'bamboo': 1.5,
      'mango': 0.9,
      'neem': 1.1,
      'eucalyptus': 1.3,
      'acacia': 1.0,
      'default': 1.0
    };
    
    // Use the highest factor among the species present
    let maxFactor = speciesFactors.default;
    for (const species of treeSpecies) {
      const factor = speciesFactors[species.toLowerCase()] || speciesFactors.default;
      if (factor > maxFactor) maxFactor = factor;
    }
    
    return maxFactor;
  }
  
  static calculateSoilCarbon(farm, groundTruthData) {
    if (!groundTruthData.soilOrganicCarbon) return 0;
    
    // Baseline SOC for conventional agriculture (%)
    const baselineSOC = 1.0;
    
    // Current SOC measurement (%)
    const currentSOC = groundTruthData.soilOrganicCarbon;
    
    // Soil bulk density (g/cm³) - typical value for agricultural soils
    const bulkDensity = 1.3;
    
    // Soil depth considered for carbon stock (cm)
    const soilDepth = 30;
    
    // Calculate carbon stock difference
    const carbonDiff = (currentSOC - baselineSOC) / 100; // Convert % to fraction
    const volumePerHectare = 10000 * soilDepth / 100; // m³/ha (10,000 m² × 0.3 m depth)
    const massPerHectare = volumePerHectare * bulkDensity * 1000; // kg/ha
    
    const carbonSequestration = carbonDiff * massPerHectare * 3.67; // Convert C to CO2 (× 44/12 ≈ 3.67)
    
    return Math.max(0, carbonSequestration) / 1000; // tons CO2/ha
  }
}

module.exports = AgroforestryCarbonCalculator;