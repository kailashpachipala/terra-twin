import math
from typing import List, Dict, Any, Tuple

def calculate_distance_m(p1: List[float], p2: List[float]) -> float:
    """
    Calculate Haversine distance in meters between two [lat, lng] points.
    """
    r = 6371000.0 # Earth Radius in meters
    lat1 = math.radians(p1[0])
    lat2 = math.radians(p2[0])
    dlat = math.radians(p2[0] - p1[0])
    dlng = math.radians(p2[1] - p1[1])
    
    a = math.sin(dlat / 2.0)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def calculate_polygon_perimeter_m(coords: List[List[float]]) -> float:
    """
    Calculate the perimeter of a polygon in meters.
    """
    if len(coords) < 2:
        return 0.0
        
    polygon_points = list(coords)
    if polygon_points[0] != polygon_points[-1]:
        polygon_points.append(polygon_points[0])
        
    total_perimeter = 0.0
    for i in range(len(polygon_points) - 1):
        total_perimeter += calculate_distance_m(polygon_points[i], polygon_points[i+1])
        
    return round(total_perimeter, 1)

def calculate_polygon_area_hectares(coords: List[List[float]]) -> float:
    """
    Calculate the spherical excess area of a polygon in hectares.
    """
    if len(coords) < 3:
        return 0.0
        
    polygon_points = list(coords)
    if polygon_points[0] != polygon_points[-1]:
        polygon_points.append(polygon_points[0])
        
    total_area = 0.0
    r = 6378137.0 # Earth semi-major axis radius in meters
    
    for i in range(len(polygon_points) - 1):
        p1 = polygon_points[i]
        p2 = polygon_points[i+1]
        
        lat1 = math.radians(p1[0])
        lat2 = math.radians(p2[0])
        lng1 = math.radians(p1[1])
        lng2 = math.radians(p2[1])
        
        total_area += (lng2 - lng1) * (2.0 + math.sin(lat1) + math.sin(lat2))
        
    area_m2 = abs(total_area * r * r / 2.0)
    
    # Convert square meters to hectares (1 hectare = 10,000 square meters)
    area_hectares = area_m2 / 10000.0
    return round(area_hectares, 2)

def is_point_in_polygon(lat: float, lng: float, polygon: List[List[float]]) -> bool:
    """
    Ray-casting algorithm to determine if point [lat, lng] is inside a polygon boundary.
    """
    n = len(polygon)
    if n < 3:
        return False
        
    inside = False
    p1 = polygon[0]
    for i in range(1, n + 1):
        p2 = polygon[i % n]
        if lat > min(p1[0], p2[0]):
            if lat <= max(p1[0], p2[0]):
                if lng <= max(p1[1], p2[1]):
                    if p1[0] != p2[0]:
                        xints = (lat - p1[0]) * (p2[1] - p1[1]) / (p2[0] - p1[0]) + p1[1]
                    if p1[1] == p2[1] or lng <= xints:
                        inside = not inside
        p1 = p2
    return inside

def get_line_intersection(p1: List[float], p2: List[float], p3: List[float], p4: List[float]) -> List[float]:
    """
    Calculate intersection of line segment (p1-p2) with (p3-p4). Returns [lat, lng] or None.
    """
    # Represent lines as Ax + By = C
    # Lat = y, Lng = x
    a1 = p2[0] - p1[0] # dLat1
    b1 = p1[1] - p2[1] # -dLng1
    c1 = a1 * p1[1] + b1 * p1[0]
    
    a2 = p4[0] - p3[0] # dLat2
    b2 = p3[1] - p4[1] # -dLng2
    c2 = a2 * p3[1] + b2 * p3[0]
    
    determinant = a1 * b2 - a2 * b1
    if determinant == 0:
        return None # Parallel
        
    lng = (b2 * c1 - b1 * c2) / determinant
    lat = (a1 * c2 - a2 * c1) / determinant
    
    # Check if intersection is within both segments
    if (min(p1[1], p2[1]) - 0.00001 <= lng <= max(p1[1], p2[1]) + 0.00001 and
        min(p1[0], p2[0]) - 0.00001 <= lat <= max(p1[0], p2[0]) + 0.00001 and
        min(p3[1], p4[1]) - 0.00001 <= lng <= max(p3[1], p4[1]) + 0.00001 and
        min(p3[0], p4[0]) - 0.00001 <= lat <= max(p3[0], p4[0]) + 0.00001):
        return [lat, lng]
        
    return None

def subdivide_polygon_into_cents(polygon: List[List[float]], target_cents: float = 15.0) -> List[List[List[float]]]:
    """
    Subdivide a farm polygon into smaller management grids of approx. target_cents (1 cent = 40.468 sqm).
    Uses coordinate-bounding boxes and clips rectangles against the parent polygon.
    """
    if len(polygon) < 3:
        return []
        
    # Ensure closed polygon
    poly = list(polygon)
    if poly[0] != poly[-1]:
        poly.append(poly[0])
        
    lats = [pt[0] for pt in poly]
    lngs = [pt[1] for pt in poly]
    min_lat, max_lat = min(lats), max(lats)
    min_lng, max_lng = min(lngs), max(lngs)
    center_lat = sum(lats) / len(lats)
    
    # Convert cents to square meters
    target_area_m2 = target_cents * 40.4686
    cell_side_m = math.sqrt(target_area_m2)
    
    # Deg conversions
    lat_step = cell_side_m / 111139.0
    lng_step = cell_side_m / (111139.0 * math.cos(math.radians(center_lat)))
    
    plots = []
    current_lat = min_lat
    while current_lat < max_lat:
        next_lat = current_lat + lat_step
        current_lng = min_lng
        while current_lng < max_lng:
            next_lng = current_lng + lng_step
            
            # Form grid cell rectangle
            cell = [
                [current_lat, current_lng],
                [next_lat, current_lng],
                [next_lat, next_lng],
                [current_lat, next_lng]
            ]
            
            # Simple clipping logic: check corners inside parent
            inside_points = []
            for pt in cell:
                if is_point_in_polygon(pt[0], pt[1], poly):
                    inside_points.append(pt)
                    
            # Find intersections between cell borders and parent borders
            intersections = []
            for j in range(4):
                cp1 = cell[j]
                cp2 = cell[(j + 1) % 4]
                for k in range(len(poly) - 1):
                    pp1 = poly[k]
                    pp2 = poly[k + 1]
                    intersect = get_line_intersection(cp1, cp2, pp1, pp2)
                    if intersect:
                        intersections.append(intersect)
                        
            # Merge inside points and intersections to approximate the plot
            plot_points = inside_points + intersections
            
            # If we have enough points, sort them angularly to form a valid polygon
            if len(plot_points) >= 3:
                # Calculate centroid of plot points
                clat = sum(pt[0] for pt in plot_points) / len(plot_points)
                clng = sum(pt[1] for pt in plot_points) / len(plot_points)
                
                # Sort points based on angle to centroid
                plot_points.sort(key=lambda pt: math.atan2(pt[0] - clat, pt[1] - clng))
                
                # Remove duplicate coordinates
                unique_points = []
                for pt in plot_points:
                    if not any(math.isclose(pt[0], u[0], abs_tol=1e-6) and math.isclose(pt[1], u[1], abs_tol=1e-6) for u in unique_points):
                        unique_points.append(pt)
                        
                if len(unique_points) >= 3:
                    # Verify that the center is actually inside the parent polygon
                    plat = sum(pt[0] for pt in unique_points) / len(unique_points)
                    plng = sum(pt[1] for pt in unique_points) / len(unique_points)
                    if is_point_in_polygon(plat, plng, poly):
                        plots.append(unique_points)
                        
            current_lng += lng_step
        current_lat += lat_step
        
    return plots
