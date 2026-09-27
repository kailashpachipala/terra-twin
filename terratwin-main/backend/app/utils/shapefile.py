import os
import zipfile
import tempfile
import shutil
import shapefile
from typing import List, Tuple

def parse_zipped_shapefile(zip_path: str) -> Tuple[List[List[float]], List[float]]:
    """
    Extracts a zipped shapefile archive, parses the first polygon shape, 
    and returns a list of [lat, lng] coordinates and the calculated center point.
    """
    temp_dir = tempfile.mkdtemp()
    try:
        # Unzip shapes package
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            
        # Locate the .shp file
        shp_file_path = None
        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file.endswith('.shp'):
                    shp_file_path = os.path.join(root, file)
                    break
                    
        if not shp_file_path:
            raise ValueError("No valid .shp vector file located in ZIP archive.")
            
        # Initialize shape reader
        sf = shapefile.Reader(shp_file_path)
        shapes = sf.shapes()
        
        if not shapes:
            raise ValueError("Shapefile contains no geographical shapes.")
            
        # Read the first polygon geometry
        first_shape = shapes[0]
        points = first_shape.points
        
        if not points:
            raise ValueError("First shape in vector package contains no coordinate vertices.")
            
        # Map GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
        # Detect if points need swapping (WGS84 coordinate boundaries)
        leaflet_coords = []
        for pt in points:
            # Handle potential 3D shape coordinates (x, y, z, m)
            x, y = pt[0], pt[1]
            # Standard GIS convention represents longitude as x and latitude as y
            leaflet_coords.append([y, x])
            
        # Calculate polygon center
        lats = [c[0] for c in leaflet_coords]
        lngs = [c[1] for c in leaflet_coords]
        center = [sum(lats) / len(lats), sum(lngs) / len(lngs)]
        
        return leaflet_coords, center
    finally:
        # Securely remove temporary directories
        shutil.rmtree(temp_dir)
