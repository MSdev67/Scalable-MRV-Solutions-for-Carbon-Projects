#!/usr/bin/env python3
"""
Main data processing script for MRV Solutions
Handles satellite data processing, carbon calculations, and report generation
"""

import argparse
import json
import os
from datetime import datetime
from carbon_calculation.carbon_model import CarbonModel
from satellite.ndvi_calculator import NDVICalculator
from geospatial.farm_boundary import FarmBoundaryProcessor

def process_satellite_data(args):
    """Process satellite imagery for NDVI calculation"""
    print(f"Processing satellite data for farm {args.farm_id}")
    
    calculator = NDVICalculator(args.red_band, args.nir_band)
    report_path = calculator.create_ndvi_report(args.farm_id, args.output_dir)
    
    if report_path:
        print(f"NDVI report generated: {report_path}")
        return report_path
    else:
        print("Failed to generate NDVI report")
        return None

def calculate_carbon_credits(args):
    """Calculate carbon credits for a farm"""
    print(f"Calculating carbon credits for farm {args.farm_id}")
    
    # Load farm data
    with open(args.farm_data, 'r') as f:
        farm_data = json.load(f)
    
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
    output_path = os.path.join(args.output_dir, f'carbon_report_{args.farm_id}.json')
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Carbon calculation complete: {output_path}")
    return output_path

def process_farm_boundaries(args):
    """Process farm boundary data"""
    print("Processing farm boundaries")
    
    processor = FarmBoundaryProcessor(args.input_file)
    
    if args.export_web:
        web_path = os.path.join(args.output_dir, 'farm_boundaries_web.geojson')
        processor.export_for_web(web_path)
        print(f"Web-optimized boundaries exported: {web_path}")
    
    if args.stats:
        stats = processor.calculate_statistics()
        stats_path = os.path.join(args.output_dir, 'boundary_statistics.json')
        with open(stats_path, 'w') as f:
            json.dump(stats, f, indent=2)
        print(f"Boundary statistics exported: {stats_path}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='MRV Solutions Data Processing')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Satellite data processing command
    satellite_parser = subparsers.add_parser('satellite', help='Process satellite imagery')
    satellite_parser.add_argument('--farm-id', required=True, help='Farm ID')
    satellite_parser.add_argument('--red-band', required=True, help='Path to red band image')
    satellite_parser.add_argument('--nir-band', required=True, help='Path to NIR band image')
    satellite_parser.add_argument('--output-dir', default='./output', help='Output directory')
    
    # Carbon calculation command
    carbon_parser = subparsers.add_parser('carbon', help='Calculate carbon credits')
    carbon_parser.add_argument('--farm-id', required=True, help='Farm ID')
    carbon_parser.add_argument('--farm-data', required=True, help='Path to farm data JSON')
    carbon_parser.add_argument('--output-dir', default='./output', help='Output directory')
    
    # Boundary processing command
    boundary_parser = subparsers.add_parser('boundary', help='Process farm boundaries')
    boundary_parser.add_argument('--input-file', required=True, help='Input boundary file')
    boundary_parser.add_argument('--output-dir', default='./output', help='Output directory')
    boundary_parser.add_argument('--export-web', action='store_true', help='Export web-optimized version')
    boundary_parser.add_argument('--stats', action='store_true', help='Calculate statistics')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Execute the appropriate command
    if args.command == 'satellite':
        process_satellite_data(args)
    elif args.command == 'carbon':
        calculate_carbon_credits(args)
    elif args.command == 'boundary':
        process_farm_boundaries(args)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()