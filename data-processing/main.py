#!/usr/bin/env python3
"""
Simplified data processing script for MRV Solutions
Handles carbon calculations and basic data processing
"""

import argparse
import json
import os
import pandas as pd
import numpy as np
from datetime import datetime
from carbon_calculation.carbon_model import CarbonModel

def calculate_carbon_credits(args):
    """Calculate carbon credits for a farm"""
    print(f"Calculating carbon credits for farm {args.farm_id}")
    
    # Load farm data
    try:
        with open(args.farm_data, 'r') as f:
            farm_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Farm data file {args.farm_data} not found")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in farm data file {args.farm_data}")
        return None
    
    # Initialize appropriate model
    model_type = farm_data.get('crop_type', 'agroforestry').lower()
    model = CarbonModel(model_type=model_type)
    
    # Validate farm data
    validation_errors = model.validate_farm_data(farm_data)
    if validation_errors:
        print("Validation errors found:")
        for error in validation_errors:
            print(f"  - {error}")
        return None
    
    # Calculate credits
    results = model.calculate_credits(farm_data)
    
    # Generate verification report
    report = model.generate_verification_report(farm_data, results)
    
    # Save results
    os.makedirs(args.output_dir, exist_ok=True)
    output_path = os.path.join(args.output_dir, f'carbon_report_{args.farm_id}.json')
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Carbon calculation complete: {output_path}")
    print(f"Total credits: {results.get('total_credits', 0):.2f}")
    
    return output_path

def process_batch_farms(args):
    """Process multiple farms from a CSV file"""
    print(f"Processing batch farms from {args.input_file}")
    
    try:
        # Read CSV file
        df = pd.read_csv(args.input_file)
        print(f"Loaded {len(df)} farms")
        
        # Process each farm
        results = []
        for _, row in df.iterrows():
            farm_data = row.to_dict()
            model_type = farm_data.get('crop_type', 'agroforestry').lower()
            
            model = CarbonModel(model_type=model_type)
            validation_errors = model.validate_farm_data(farm_data)
            
            if validation_errors:
                print(f"Skipping farm {farm_data.get('farm_id', 'unknown')} due to validation errors")
                continue
            
            calculation = model.calculate_credits(farm_data)
            results.append({
                'farm_id': farm_data.get('farm_id', 'unknown'),
                'crop_type': farm_data.get('crop_type'),
                'area_ha': farm_data.get('area_ha'),
                'calculated_credits': calculation.get('total_credits', 0),
                'calculation_date': datetime.now().isoformat()
            })
        
        # Save batch results
        os.makedirs(args.output_dir, exist_ok=True)
        output_path = os.path.join(args.output_dir, 'batch_results.csv')
        
        results_df = pd.DataFrame(results)
        results_df.to_csv(output_path, index=False)
        
        print(f"Batch processing complete: {output_path}")
        print(f"Total credits across all farms: {results_df['calculated_credits'].sum():.2f}")
        
        return output_path
        
    except Exception as e:
        print(f"Error processing batch file: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description='MRV Solutions Data Processing')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Carbon calculation command
    carbon_parser = subparsers.add_parser('carbon', help='Calculate carbon credits')
    carbon_parser.add_argument('--farm-id', required=True, help='Farm ID')
    carbon_parser.add_argument('--farm-data', required=True, help='Path to farm data JSON')
    carbon_parser.add_argument('--output-dir', default='./output', help='Output directory')
    
    # Batch processing command
    batch_parser = subparsers.add_parser('batch', help='Process multiple farms from CSV')
    batch_parser.add_argument('--input-file', required=True, help='Input CSV file with farm data')
    batch_parser.add_argument('--output-dir', default='./output', help='Output directory')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Execute the appropriate command
    if args.command == 'carbon':
        calculate_carbon_credits(args)
    elif args.command == 'batch':
        process_batch_farms(args)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()