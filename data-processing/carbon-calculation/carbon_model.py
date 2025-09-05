import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional

class CarbonModel:
    def __init__(self, model_type='agroforestry'):
        self.model_type = model_type
        self.parameters = self.load_parameters()
        
    def load_parameters(self):
        """Load model parameters based on type"""
        if self.model_type == 'agroforestry':
            return {
                'tree_growth_rate': 0.8,  # kg CO2 per tree per year
                'soil_carbon_accumulation': 0.3,  # tCO2/ha/year
                'baseline_emissions': 2.5,  # tCO2/ha/year
                'lifespan': 30,  # years
                'maturity_age': 10  # years to reach maturity
            }
        elif self.model_type == 'rice':
            return {
                'methane_reduction': 0.6,  # % reduction from AWD
                'n2o_reduction': 0.3,  # % reduction from organic amendments
                'baseline_emissions': 3.2,  # tCO2eq/ha/year
                'practice_factors': {
                    'AWD': 0.4,
                    'compost': 0.7,
                    'cover_crop': 0.8,
                    'reduced_tillage': 0.9
                }
            }
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
            
    def calculate_agroforestry_credits(self, farm_data: Dict) -> Dict:
        """Calculate carbon credits for agroforestry"""
        area = farm_data['area_ha']
        tree_count = farm_data.get('tree_count', 0)
        establishment_date = datetime.strptime(farm_data['establishment_date'], '%Y-%m-%d')
        current_date = datetime.now()
        
        # Calculate project age in years
        project_age = (current_date - establishment_date).days / 365.25
        
        # Calculate tree carbon
        tree_carbon = self.calculate_tree_carbon(tree_count, project_age)
        
        # Calculate soil carbon
        soil_carbon = self.parameters['soil_carbon_accumulation'] * area * min(project_age, self.parameters['lifespan'])
        
        # Calculate baseline emissions
        baseline = self.parameters['baseline_emissions'] * area * project_age
        
        # Total credits (avoided emissions + sequestration)
        total_credits = tree_carbon + soil_carbon + baseline
        
        return {
            'tree_carbon': tree_carbon,
            'soil_carbon': soil_carbon,
            'baseline_emissions': baseline,
            'total_credits': total_credits,
            'credits_per_year': total_credits / max(project_age, 1),
            'model_type': self.model_type,
            'calculation_date': current_date.isoformat()
        }
        
    def calculate_tree_carbon(self, tree_count: int, project_age: float) -> float:
        """Calculate carbon sequestration from trees"""
        maturity_factor = min(project_age / self.parameters['maturity_age'], 1.0)
        return tree_count * self.parameters['tree_growth_rate'] * project_age * maturity_factor
        
    def calculate_rice_credits(self, farm_data: Dict) -> Dict:
        """Calculate carbon credits for rice cultivation"""
        area = farm_data['area_ha']
        practices = farm_data.get('practices', [])
        establishment_date = datetime.strptime(farm_data['establishment_date'], '%Y-%m-%d')
        current_date = datetime.now()
        project_age = (current_date - establishment_date).days / 365.25
        
        # Calculate practice factor
        practice_factor = 1.0
        for practice in practices:
            practice_factor *= self.parameters['practice_factors'].get(practice, 1.0)
            
        # Calculate reduced emissions
        baseline_emissions = self.parameters['baseline_emissions'] * area * project_age
        project_emissions = baseline_emissions * practice_factor
        emission_reduction = baseline_emissions - project_emissions
        
        return {
            'baseline_emissions': baseline_emissions,
            'project_emissions': project_emissions,
            'emission_reduction': emission_reduction,
            'total_credits': emission_reduction,
            'practice_factor': practice_factor,
            'model_type': self.model_type,
            'calculation_date': current_date.isoformat()
        }
        
    def calculate_credits(self, farm_data: Dict) -> Dict:
        """Calculate carbon credits based on farm type"""
        if self.model_type == 'agroforestry':
            return self.calculate_agroforestry_credits(farm_data)
        elif self.model_type == 'rice':
            return self.calculate_rice_credits(farm_data)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
            
    def validate_farm_data(self, farm_data: Dict) -> List[str]:
        """Validate farm data for carbon calculation"""
        errors = []
        
        required_fields = ['area_ha', 'establishment_date', 'crop_type']
        for field in required_fields:
            if field not in farm_data:
                errors.append(f"Missing required field: {field}")
                
        if 'establishment_date' in farm_data:
            try:
                establishment_date = datetime.strptime(farm_data['establishment_date'], '%Y-%m-%d')
                if establishment_date > datetime.now():
                    errors.append("Establishment date cannot be in the future")
            except ValueError:
                errors.append("Invalid establishment date format. Use YYYY-MM-DD")
                
        if farm_data.get('area_ha', 0) <= 0:
            errors.append("Farm area must be greater than 0")
            
        return errors
        
    def generate_verification_report(self, farm_data: Dict, calculation_results: Dict) -> Dict:
        """Generate a verification report for carbon credits"""
        validation_errors = self.validate_farm_data(farm_data)
        
        report = {
            'farm_id': farm_data.get('farm_id', 'unknown'),
            'calculation_date': datetime.now().isoformat(),
            'model_type': self.model_type,
            'validation_errors': validation_errors,
            'calculation_results': calculation_results,
            'verification_status': 'pending',
            'recommendations': []
        }
        
        if not validation_errors:
            report['verification_status'] = 'ready_for_verification'
            
        return report