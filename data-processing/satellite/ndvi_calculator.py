import rasterio
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import json
import os

class NDVICalculator:
    def __init__(self, red_band_path, nir_band_path):
        self.red_band_path = red_band_path
        self.nir_band_path = nir_band_path
        
    def calculate_ndvi(self):
        """Calculate NDVI from red and NIR bands"""
        try:
            with rasterio.open(self.red_band_path) as red_src:
                red_band = red_src.read(1).astype('float64')
                
            with rasterio.open(self.nir_band_path) as nir_src:
                nir_band = nir_src.read(1).astype('float64')
                
            # Avoid division by zero
            mask = (red_band + nir_band) == 0
            ndvi = (nir_band - red_band) / (nir_band + red_band)
            ndvi[mask] = 0
            
            return ndvi
            
        except Exception as e:
            print(f"Error calculating NDVI: {e}")
            return None
            
    def save_ndvi_geotiff(self, output_path, profile):
        """Save NDVI as GeoTIFF"""
        ndvi = self.calculate_ndvi()
        if ndvi is not None:
            profile.update(
                dtype=rasterio.float32,
                count=1,
                compress='lzw'
            )
            
            with rasterio.open(output_path, 'w', **profile) as dst:
                dst.write(ndvi.astype(rasterio.float32), 1)
                
            return True
        return False
        
    def calculate_statistics(self, ndvi_array):
        """Calculate statistics for NDVI array"""
        if ndvi_array is None:
            return None
            
        return {
            'mean': float(np.nanmean(ndvi_array)),
            'median': float(np.nanmedian(ndvi_array)),
            'std': float(np.nanstd(ndvi_array)),
            'min': float(np.nanmin(ndvi_array)),
            'max': float(np.nanmax(ndvi_array)),
            'date_calculated': datetime.now().isoformat()
        }
        
    def create_ndvi_report(self, farm_id, output_dir):
        """Create a comprehensive NDVI report"""
        ndvi = self.calculate_ndvi()
        if ndvi is None:
            return None
            
        stats = self.calculate_statistics(ndvi)
        
        # Create visualization
        plt.figure(figsize=(10, 8))
        plt.imshow(ndvi, cmap='YlGn', vmin=-1, vmax=1)
        plt.colorbar(label='NDVI')
        plt.title(f'NDVI Map for Farm {farm_id}')
        plt.axis('off')
        
        visualization_path = os.path.join(output_dir, f'ndvi_map_{farm_id}.png')
        plt.savefig(visualization_path, bbox_inches='tight', dpi=300)
        plt.close()
        
        # Save statistics
        report = {
            'farm_id': farm_id,
            'statistics': stats,
            'visualization_path': visualization_path,
            'timestamp': datetime.now().isoformat()
        }
        
        report_path = os.path.join(output_dir, f'ndvi_report_{farm_id}.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report_path