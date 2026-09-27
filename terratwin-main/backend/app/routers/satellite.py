from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..services.earth_engine import ee_service

router = APIRouter(prefix="/api/satellite", tags=["Satellite Intelligence"])

@router.get("/indices/{farm_id}", response_model=schemas.SatelliteIndexResponse)
def get_indices(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    # Calculate GEE indices
    indices = ee_service.get_indices(farm.polygon)
    return {
        "ndvi_mean": indices["ndvi"],
        "ndwi_mean": indices["ndwi"],
        "evi_mean": indices["evi"],
        "gndvi_mean": indices["gndvi"],
        "moisture_stress": int((1.0 - indices.get("ndmi", 0.7)) * 50),
        "cloud_cover": indices["cloud_cover"]
    }

@router.get("/tiles/{farm_id}/{layer_type}", response_model=schemas.TileResponse)
def get_tile_url(
    farm_id: int,
    layer_type: str, # "rgb", "ndvi", "ndwi", "moisture"
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    # Calculate visual GEE MapId tiles
    tile_url = ee_service.get_map_tile_url(farm.polygon, layer_type)
    return {
        "tile_url": tile_url,
        "layer_type": layer_type
    }
