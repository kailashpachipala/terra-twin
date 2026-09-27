from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Farm Manager"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    token: str
    user: UserResponse

class FarmCreate(BaseModel):
    name: str
    location: str
    polygon: Optional[List[List[float]]] = None
    coordinates: List[float] # [lat, lng]
    crop_type: str
    size_hectares: float

class ManagementPlotResponse(BaseModel):
    id: int
    plot_uuid: str
    polygon: List[List[float]]
    coordinates: List[float]
    area_sqm: float
    cents: float
    ndvi: float
    ndwi: float
    moisture: float
    lst_f: float
    temperature_f: float
    soil_ph: float

    class Config:
        from_attributes = True

class FarmResponse(BaseModel):
    id: int
    name: str
    location: str
    polygon: Optional[List[List[float]]] = None
    coordinates: List[float]
    crop_type: str
    size_hectares: float
    area_hectares: Optional[float] = None
    perimeter_meters: Optional[float] = None
    health_score: int
    moisture_stress: int
    management_plots: List[ManagementPlotResponse] = []

    class Config:
        from_attributes = True

class SatelliteIndexResponse(BaseModel):
    ndvi_mean: float
    ndwi_mean: float
    evi_mean: float
    gndvi_mean: float
    moisture_stress: int
    cloud_cover: float

class TileResponse(BaseModel):
    tile_url: str
    layer_type: str

class PredictYieldResponse(BaseModel):
    predicted_yield_tons_per_acre: float
    base_value: float
    confidence_percentage: float
    shap_contributions: List[Dict[str, Any]]
    model_type: str

class PredictRiskResponse(BaseModel):
    disease_risk: str
    disease_details: str
    pest_risk: str
    pest_details: str
    model_type: str

class MarketIntelligenceResponse(BaseModel):
    current_price_per_ton: float
    historical_avg_price: float
    price_trend: str
    future_forecast_price: float
    demand_supply_status: str
    estimated_profit: float
    cost_of_cultivation: float
    transportation_cost: float
    best_selling_time: str
    market_recommendation: str

class TerrainClimateResponse(BaseModel):
    flood_risk: str
    heat_stress: str
    drought_risk: str
    carbon_score: float
    elevation_m: float
    slope_deg: float

class ForecastHorizon7d(BaseModel):
    expected_moisture_stress: int
    expected_irrigation_requirement_liters: float
    weather_outlook: str

class ForecastHorizon30d(BaseModel):
    expected_moisture_stress: int
    expected_yield_tons_acre: float
    next_crop_stage: str
    expected_harvest_date: str
    expected_price_trend: str

class FutureForecastResponse(BaseModel):
    forecast_horizon_7d: ForecastHorizon7d
    forecast_horizon_30d: ForecastHorizon30d
    attribution: str

class ChatQuery(BaseModel):
    query: str
    farm_id: int

class ChatResponse(BaseModel):
    reply: str
