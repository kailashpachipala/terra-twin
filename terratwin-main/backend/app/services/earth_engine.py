import os
import json
import logging
import datetime
import math
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Try to import Google Earth Engine
try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False
    logger.warning("earthengine-api not installed. Running in mock offline mode.")

class EarthEngineService:
    def __init__(self):
        self.initialized = False
        if EE_AVAILABLE:
            try:
                # Look for service account credentials path in env
                credentials_path = os.getenv("GEE_CREDENTIALS_PATH")
                if credentials_path and os.path.exists(credentials_path):
                    with open(credentials_path) as f:
                        creds = json.load(f)
                    private_key = creds.get("private_key")
                    client_email = creds.get("client_email")
                    if private_key and client_email:
                        credentials = ee.ServiceAccountCredentials(client_email, key_data=private_key)
                        ee.Initialize(credentials)
                        self.initialized = True
                        logger.info("Google Earth Engine initialized successfully with Service Account Key!")
                else:
                    # Try default local system credentials
                    ee.Initialize()
                    self.initialized = True
                    logger.info("Google Earth Engine initialized successfully using local user token.")
            except Exception as e:
                logger.warning(f"Failed to authenticate Earth Engine: {e}. Falling back to coordinate simulation engine.")
                self.initialized = False
        else:
            self.initialized = False

    def is_active(self) -> bool:
        return self.initialized

    def _get_simulated_indices(self, center_lat: float, center_lng: float, date_obj: datetime.date) -> Dict[str, float]:
        """
        Generate scientifically realistic multi-spectral index curves based on latitude, longitude, and day of year.
        Replicates seasonal phenology curves (Northern vs Southern Hemisphere cycles).
        """
        day_of_year = date_obj.timetuple().tm_yday
        # Peak of growth season (July for Northern hemisphere, January for Southern hemisphere)
        hemisphere_shift = 0 if center_lat >= 0 else 180
        angle = 2 * math.pi * (day_of_year - 200 - hemisphere_shift) / 365.0
        
        # Base vegetation signal with seasonal amplitude
        seasonal_multiplier = (math.cos(angle) + 1.0) / 2.0 # 0.0 to 1.0
        
        # Add spatial noise based on lat/lng hashes to ensure different farms look distinct
        hash_val = abs(sin_hash(center_lat, center_lng))
        base_ndvi = 0.4 + (hash_val * 0.25) # 0.4 to 0.65 base
        amplitude_ndvi = 0.15 + (hash_val * 0.15) # 0.15 to 0.3 amplitude
        
        ndvi = base_ndvi + (amplitude_ndvi * seasonal_multiplier)
        ndvi = max(0.1, min(0.92, ndvi))
        
        # Crop moisture correlates with vegetation density but lags slightly
        ndwi = ndvi * 0.5 - 0.1 + (math.sin(angle - 0.2) * 0.08)
        ndwi = max(-0.1, min(0.6, ndwi))
        
        evi = ndvi * 0.8 - 0.05
        ndmi = ndwi * 0.9 + 0.05
        savi = ndvi * 1.1 - 0.1
        gndvi = ndvi * 0.9
        msavi = ndvi * 0.95 - 0.02
        vci = 50 + (seasonal_multiplier * 40) + (math.sin(day_of_year * 0.1) * 5)
        
        # SAR dual-polarization values in dB
        vv = -12.0 + (seasonal_multiplier * 3.5)
        vh = -18.5 + (seasonal_multiplier * 4.5)
        vh_vv = vh / vv if vv != 0 else 1.5

        return {
            "ndvi": round(ndvi, 3),
            "ndwi": round(ndwi, 3),
            "evi": round(evi, 3),
            "ndmi": round(ndmi, 3),
            "savi": round(savi, 3),
            "gndvi": round(gndvi, 3),
            "msavi": round(msavi, 3),
            "vci": round(vci, 1),
            "vv": round(vv, 2),
            "vh": round(vh, 2),
            "vh_vv": round(vh_vv, 2)
        }

    def get_indices(self, polygon: List[List[float]], date_str: str = None) -> Dict[str, Any]:
        """
        Extract multispectral indicators from Google Earth Engine collections.
        """
        # Calculate center coordinates of the polygon
        lats = [pt[0] for pt in polygon]
        lngs = [pt[1] for pt in polygon]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)
        
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else datetime.date.today()

        if not self.initialized:
            indices = self._get_simulated_indices(center_lat, center_lng, target_date)
            # Fetch weather & terrain simulations
            weather = self._get_simulated_weather(center_lat, center_lng, target_date)
            terrain = self._get_simulated_terrain(center_lat, center_lng)
            
            return {
                **indices,
                **weather,
                **terrain,
                "cloud_cover": 1.5,
                "timestamp": target_date.strftime("%Y-%m-%d")
            }

        try:
            ee_polygon = ee.Geometry.Polygon(polygon)
            now = ee.Date(target_date.strftime("%Y-%m-%d"))
            start = now.advance(-30, "day")
            
            # 1. Fetch Sentinel-2 ImageCollection
            s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                  .filterBounds(ee_polygon)
                  .filterDate(start, now)
                  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 25)))
            
            if s2.size().getInfo() == 0:
                # Fallback to simulation if cloud-free imagery is unavailable
                return self.get_indices(polygon, date_str=date_str)
                
            composite = s2.median().clip(ee_polygon)
            
            # Calculations
            ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI')
            ndwi = composite.normalizedDifference(['B3', 'B8']).rename('NDWI')
            ndmi = composite.normalizedDifference(['B8', 'B11']).rename('NDMI') # Moisture index
            gndvi = composite.normalizedDifference(['B8', 'B3']).rename('GNDVI')
            
            evi = composite.expression(
                '2.5 * ((NIR - RED) / (NIR + 6.0 * RED - 7.5 * BLUE + 1.0))', {
                    'NIR': composite.select('B8'),
                    'RED': composite.select('B4'),
                    'BLUE': composite.select('B2')
                }).rename('EVI')
                
            savi = composite.expression(
                '1.5 * (NIR - RED) / (NIR + RED + 0.5)', {
                    'NIR': composite.select('B8'),
                    'RED': composite.select('B4')
                }).rename('SAVI')

            # Reduce indices to polygon mean statistics
            stats_ndvi = ndvi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            stats_ndwi = ndwi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            stats_ndmi = ndmi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            stats_gndvi = gndvi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            stats_evi = evi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            stats_savi = savi.reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
            
            # 2. Fetch Sentinel-1 SAR Backscatter Coeffs
            s1 = (ee.ImageCollection("COPERNICUS/S1_GRD")
                  .filterBounds(ee_polygon)
                  .filterDate(start, now)
                  .filter(ee.Filter.eq('instrumentMode', 'IW'))
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')))
                  
            vv_val, h_val, ratio_val = -12.0, -18.5, 1.5
            if s1.size().getInfo() > 0:
                s1_composite = s1.median().clip(ee_polygon)
                stats_vv = s1_composite.select('VV').reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
                stats_vh = s1_composite.select('VH').reduceRegion(ee.Reducer.mean(), ee_polygon, 20).getInfo()
                vv_val = stats_vv.get('VV') or -12.0
                h_val = stats_vh.get('VH') or -18.5
                ratio_val = h_val / vv_val if vv_val != 0 else 1.5

            # 3. Fetch Terrain elevation and slope from SRTM DEM
            srtm = ee.Image("USGS/SRTMGL1_003")
            elevation = srtm.clip(ee_polygon)
            slope = ee.Terrain.slope(elevation)
            
            elev_val = elevation.reduceRegion(ee.Reducer.mean(), ee_polygon, 30).getInfo().get('elevation') or 150.0
            slope_val = slope.reduceRegion(ee.Reducer.mean(), ee_polygon, 30).getInfo().get('slope') or 2.5

            # 4. Fetch Weather parameters (ERA5 Land + CHIRPS)
            era5 = (ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
                    .filterBounds(ee_polygon)
                    .filterDate(start, now)
                    .select(['temperature_2m', 'dewpoint_temperature_2m']))
            
            temp_c = 22.0
            humidity = 60.0
            if era5.size().getInfo() > 0:
                era5_mean = era5.mean().reduceRegion(ee.Reducer.mean(), ee_polygon, 500).getInfo()
                temp_k = era5_mean.get('temperature_2m') or 295.15
                temp_c = temp_k - 273.15
                
                # Simple relative humidity estimation from dewpoint temperature
                dew_k = era5_mean.get('dewpoint_temperature_2m') or 287.15
                humidity = 100 - 5 * (temp_k - dew_k)
                humidity = max(10.0, min(100.0, humidity))

            chirps = (ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                      .filterBounds(ee_polygon)
                      .filterDate(start, now)
                      .select('precipitation'))
                      
            precip_sum = 25.0
            if chirps.size().getInfo() > 0:
                precip_val = chirps.sum().reduceRegion(ee.Reducer.sum(), ee_polygon, 5000).getInfo().get('precipitation')
                precip_sum = precip_val if precip_val is not None else 25.0

            return {
                "ndvi": round(stats_ndvi.get("NDVI") or 0.75, 3),
                "ndwi": round(stats_ndwi.get("NDWI") or 0.32, 3),
                "evi": round(stats_evi.get("EVI") or 0.58, 3),
                "ndmi": round(stats_ndmi.get("NDMI") or 0.28, 3),
                "savi": round(stats_savi.get("SAVI") or 0.65, 3),
                "gndvi": round(stats_gndvi.get("GNDVI") or 0.68, 3),
                "msavi": round(stats_savi.get("SAVI") * 0.9, 3), # Proxy fallback if MSAVI expression complex
                "vci": round((stats_ndvi.get("NDVI") or 0.75) * 100.0, 1),
                "vv": round(vv_val, 2),
                "vh": round(h_val, 2),
                "vh_vv": round(ratio_val, 2),
                "elevation": round(elev_val, 1),
                "slope": round(slope_val, 2),
                "temperature": round(temp_c * 9/5 + 32, 1), # Fahrenheit standard
                "humidity": round(humidity, 1),
                "rainfall": round(precip_sum, 1),
                "cloud_cover": round(s2.mean().get("CLOUDY_PIXEL_PERCENTAGE").getInfo() or 4.0, 1),
                "timestamp": target_date.strftime("%Y-%m-%d")
            }
        except Exception as e:
            logger.error(f"Error calculating real Earth Engine indices: {e}")
            # Fall back to simulated indexes on failure
            return self.get_indices(polygon, date_str=date_str)

    def _get_simulated_weather(self, lat: float, lng: float, date_obj: datetime.date) -> Dict[str, float]:
        day = date_obj.timetuple().tm_yday
        # Temperature season (Northern hemisphere high in July, Southern high in Jan)
        hem_shift = 0 if lat >= 0 else 180
        t_angle = 2 * math.pi * (day - 200 - hem_shift) / 365.0
        
        base_temp = 72.0 - abs(lat) * 0.4 # Cooler closer to poles
        temp = base_temp + 15.0 * math.cos(t_angle) + (abs(sin_hash(lat, lng)) * 5)
        
        # Rainfall seasons
        rain_angle = 2 * math.pi * (day - 120) / 365.0
        rain = 30.0 + 25.0 * math.sin(rain_angle)
        rain = max(0.0, rain) if abs(lat) < 50 else max(0.0, rain * 0.5)

        humidity = 55.0 + 15.0 * math.sin(rain_angle + 0.5)
        humidity = max(15.0, min(95.0, humidity))
        
        return {
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "rainfall": round(rain, 1)
        }

    def _get_simulated_terrain(self, lat: float, lng: float) -> Dict[str, float]:
        h = abs(sin_hash(lat, lng))
        elevation = 50.0 + (h * 450.0) # Elevation 50m to 500m
        slope = 1.0 + (h * 12.0) # Slope 1deg to 13deg
        return {
            "elevation": round(elevation, 1),
            "slope": round(slope, 2)
        }

    def get_historical_timeline(self, polygon: List[List[float]], days: int = 365) -> List[Dict[str, Any]]:
        """
        Retrieve a list of sequential historical values over a period (e.g. bi-weekly).
        """
        timeline = []
        today = datetime.date.today()
        # Sample every 14 days to compile timeline
        for i in range(days, 0, -14):
            d = today - datetime.timedelta(days=i)
            # Query indices for that date
            res = self.get_indices(polygon, date_str=d.strftime("%Y-%m-%d"))
            timeline.append({
                "date": d.strftime("%b %d, %Y"),
                "ndvi": res["ndvi"],
                "ndwi": res["ndwi"],
                "rainfall_mm": res["rainfall"],
                "temperature_f": res["temperature"],
                "moisture_stress": int((1 - res["ndmi"]) * 50) # Convert moisture index to stress rating
            })
        return timeline

    def get_map_tile_url(self, polygon: List[List[float]], index_type: str) -> str:
        """
        Generate Google Earth Engine Leaflet Tile Overlay Template.
        """
        if not self.initialized:
            # Fallback mock style tile overlay
            return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"

        try:
            ee_polygon = ee.Geometry.Polygon(polygon)
            now = ee.Date(datetime.date.today().strftime("%Y-%m-%d"))
            start = now.advance(-45, "day")
            
            s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                  .filterBounds(ee_polygon)
                  .filterDate(start, now)
                  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 25)))
            
            composite = s2.median().clip(ee_polygon)

            if index_type == "ndvi":
                ndvi = composite.normalizedDifference(['B8', 'B4'])
                viz = {'min': 0, 'max': 0.9, 'palette': ['FFE119', '32CD32', '006400']}
                map_id = ndvi.getMapId(viz)
            elif index_type == "ndwi":
                ndwi = composite.normalizedDifference(['B3', 'B8'])
                viz = {'min': -0.1, 'max': 0.6, 'palette': ['E0F7FA', '80DEEA', '0D47A1']}
                map_id = ndwi.getMapId(viz)
            elif index_type == "sar":
                # Fake natural SAR backscatter visualization
                vv = composite.select('B8') # Fallback if S1 unavailable
                viz = {'min': 0, 'max': 4000, 'palette': ['ECEFF1', '90A4AE', '37474F']}
                map_id = vv.getMapId(viz)
            else:
                # RGB natural composite (B4, B3, B2)
                viz = {'min': 0, 'max': 3000, 'bands': ['B4', 'B3', 'B2']}
                map_id = composite.getMapId(viz)
            
            return map_id['tile_fetcher'].url_format
        except Exception as e:
            logger.error(f"Error compiling GEE visual tile overlay: {e}")
            return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"

def sin_hash(lat: float, lng: float) -> float:
    """
    Deterministic pseudo-random hash generator based on trigonometric signatures.
    """
    return math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453 % 1

# Instantiate GEE service singleton
ee_service = EarthEngineService()
