import geopandas as gpd
from shapely.geometry import Polygon, Point
import pandas as pd
import json

class FarmBoundaryProcessor:
    def __init__(self, boundary_file=None):
        self.boundary_file = boundary_file
        self.gdf = None
        
        if boundary_file:
            self.load_boundary_file()
            
    def load_boundary_file(self):
        """Load boundary file (GeoJSON, Shapefile, etc.)"""
        try:
            self.gdf = gpd.read_file(self.boundary_file)
            print(f"Loaded {len(self.gdf)} boundaries")
        except Exception as e:
            print(f"Error loading boundary file: {e}")
            
    def create_from_coordinates(self, coordinates, farm_id, properties=None):
        """Create farm boundary from coordinates"""
        polygon = Polygon(coordinates)
        
        if properties is None:
            properties = {}
            
        properties['farm_id'] = farm_id
        properties['area_ha'] = self.calculate_area(polygon)
        
        gdf = gpd.GeoDataFrame(
            [properties],
            geometry=[polygon],
            crs="EPSG:4326"
        )
        
        return gdf
        
    def calculate_area(self, geometry):
        """Calculate area in hectares"""
        # Convert to equal area projection for accurate area calculation
        geometry_aea = geometry.to_crs(epsg=3857)
        area_sq_m = geometry_aea.area
        area_ha = area_sq_m / 10000
        return area_ha
        
    def find_farms_within_radius(self, center_point, radius_km):
        """Find farms within a given radius"""
        if self.gdf is None:
            return None
            
        # Create buffer around center point
        center_gdf = gpd.GeoDataFrame(
            [{'name': 'center'}],
            geometry=[center_point],
            crs="EPSG:4326"
        )
        
        # Convert to projected CRS for accurate distance calculation
        center_proj = center_gdf.to_crs(epsg=3857)
        buffer = center_proj.buffer(radius_km * 1000)  # Convert km to meters
        
        # Convert back to geographic CRS
        buffer_geo = buffer.to_crs(epsg=4326)
        
        # Find intersecting farms
        intersecting_farms = self.gdf[self.gdf.intersects(buffer_geo.iloc[0])]
        
        return intersecting_farms
        
    def save_to_geojson(self, output_path):
        """Save boundaries to GeoJSON file"""
        if self.gdf is not None:
            self.gdf.to_file(output_path, driver='GeoJSON')
            return True
        return False
        
    def export_for_web(self, output_path):
        """Export simplified version for web mapping"""
        if self.gdf is not None:
            # Simplify geometry for web performance
            simplified_gdf = self.gdf.copy()
            simplified_gdf['geometry'] = simplified_gdf.simplify(0.001)
            
            # Convert to GeoJSON
            geojson = simplified_gdf.to_json()
            
            with open(output_path, 'w') as f:
                f.write(geojson)
                
            return True
        return False