from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..services.ai_engine import ai_engine
from ..services.earth_engine import ee_service

router = APIRouter(prefix="/api/analytics", tags=["AI Analytics & Projections"])

@router.get("/yield/{farm_id}", response_model=schemas.PredictYieldResponse)
def get_yield_forecast(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    # Extract recent satellite metrics to feed the yield predictor
    indices = ee_service.get_indices(farm.polygon)
    
    # Trigger AI yield model (LightGBM Regression)
    prediction = ai_engine.predict_yield_and_explain(
        crop_type=farm.crop_type,
        ndvi=indices.get("ndvi", 0.75),
        soil_n=farm.soil_health.get("n", 42) if farm.soil_health else 42.0,
        moisture_stress=indices.get("moisture_stress", 15)
    )

    # Save to DB Prediction History
    db_pred = models.PredictionRecord(
        farm_id=farm.id,
        target="yield",
        value=prediction["predicted_yield_tons_per_acre"],
        confidence=prediction["confidence_percentage"],
        model_name=prediction["model_type"],
        explanation=prediction["shap_contributions"]
    )
    db.add(db_pred)
    db.commit()

    return prediction

@router.get("/risks/{farm_id}", response_model=schemas.PredictRiskResponse)
def get_pathogen_risks(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    indices = ee_service.get_indices(farm.polygon)
    
    # Assess risks using local weather profile
    prediction = ai_engine.assess_climate_pathogen_risk(
        humidity=indices.get("humidity", 60.0),
        temp_f=indices.get("temperature", 75.0)
    )

    # Save to DB Prediction History
    db_pred_disease = models.PredictionRecord(
        farm_id=farm.id,
        target="disease",
        value=1.0 if prediction["disease_risk"] == "High" else 0.5 if prediction["disease_risk"] == "Moderate" else 0.1,
        confidence=90.0,
        model_name=prediction["model_type"],
        explanation={"details": prediction["disease_details"]}
    )
    db.add(db_pred_disease)
    db.commit()

    return prediction

@router.get("/market/{farm_id}", response_model=schemas.MarketIntelligenceResponse)
def get_market_intelligence(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
        
    # Get geodetic area if calculated, else fallback to size declared by user
    area_ha = farm.area_hectares if farm.area_hectares is not None else farm.size_hectares
    
    market_data = ai_engine.get_market_intelligence(farm.crop_type, area_ha)
    return market_data

@router.get("/terrain-climate/{farm_id}", response_model=schemas.TerrainClimateResponse)
def get_terrain_climate_risks(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
        
    indices = ee_service.get_indices(farm.polygon)
    area_ha = farm.area_hectares if farm.area_hectares is not None else farm.size_hectares
    
    terrain_data = ai_engine.assess_terrain_climate_risks(
        elevation=indices.get("elevation", 120.0),
        slope=indices.get("slope", 1.8),
        temperature_f=indices.get("temperature", 75.0),
        rainfall_mm=indices.get("rainfall", 25.0),
        ndvi=indices.get("ndvi", 0.75),
        area_hectares=area_ha
    )
    return terrain_data

@router.get("/forecast/{farm_id}", response_model=schemas.FutureForecastResponse)
def get_future_forecasts(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
        
    indices = ee_service.get_indices(farm.polygon)
    
    forecast_data = ai_engine.get_future_predictions(
        crop_type=farm.crop_type,
        current_ndvi=indices.get("ndvi", 0.75),
        current_moisture_stress=int((1.0 - indices.get("ndmi", 0.7)) * 50),
        temperature_f=indices.get("temperature", 75.0),
        rainfall_mm=indices.get("rainfall", 25.0)
    )
    return forecast_data

@router.get("/what-if/{farm_id}")
def simulate_what_if(
    farm_id: int,
    temp_f: float,
    humidity: float,
    rainfall: float,
    irrigation: float,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
        
    res = ai_engine.simulate_what_if_impact(
        temperature_f=temp_f,
        humidity=humidity,
        rainfall_mm=rainfall,
        irrigation_liters=irrigation,
        crop_type=farm.crop_type
    )
    return res
