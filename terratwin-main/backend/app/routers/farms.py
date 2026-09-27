import os
import tempfile
import shutil
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth
from ..utils.geo import calculate_polygon_area_hectares, calculate_polygon_perimeter_m, subdivide_polygon_into_cents
from ..utils.shapefile import parse_zipped_shapefile

router = APIRouter(prefix="/api/farms", tags=["Farms"])

@router.get("", response_model=List[schemas.FarmResponse])
def get_farms(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user_farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    
    # If the user has no farms registered, auto-initialize the default GITAM Visakhapatnam research plot twin!
    if not user_farms:
        # GITAM University Visakhapatnam, Andhra Pradesh, India coordinates
        gitam_boundary = [
            [17.7836, 83.3748],
            [17.7836, 83.3788],
            [17.7796, 83.3788],
            [17.7796, 83.3748],
            [17.7836, 83.3748]
        ]
        gitam_center = [17.7816, 83.3768]
        
        area_calc = calculate_polygon_area_hectares(gitam_boundary)
        perimeter_calc = calculate_polygon_perimeter_m(gitam_boundary)
        
        default_farm = models.Farm(
            user_id=current_user.id,
            name="GITAM Research Crop Twin",
            location="Visakhapatnam, Andhra Pradesh, India",
            polygon=gitam_boundary,
            coordinates=gitam_center,
            crop_type="Wine Grapes",
            size_hectares=area_calc,
            area_hectares=area_calc,
            perimeter_meters=perimeter_calc,
            health_score=85,
            moisture_stress=18
        )
        db.add(default_farm)
        db.commit()
        db.refresh(default_farm)
        
        # Subdivide GITAM into management plots of approx 15 cents
        sub_polys = subdivide_polygon_into_cents(gitam_boundary, target_cents=15.0)
        
        # Fallback to single plot if subdivision fails
        if not sub_polys:
            sub_polys = [gitam_boundary]
            
        for idx, sub_poly in enumerate(sub_polys):
            sub_area_ha = calculate_polygon_area_hectares(sub_poly)
            sub_area_sqm = sub_area_ha * 10000.0
            sub_cents = sub_area_sqm / 40.4686
            
            slats = [pt[0] for pt in sub_poly]
            slngs = [pt[1] for pt in sub_poly]
            scenter = [sum(slats) / len(slats), sum(slngs) / len(slngs)]
            
            plot_uuid = f"Plot-{idx+1:02d}"
            
            # Generate deterministic values based on plot index
            db_plot = models.ManagementPlot(
                farm_id=default_farm.id,
                plot_uuid=plot_uuid,
                polygon=sub_poly,
                coordinates=scenter,
                area_sqm=round(sub_area_sqm, 1),
                cents=round(sub_cents, 1),
                ndvi=round(0.76 - (idx * 0.015), 2),
                ndwi=round(0.34 - (idx * 0.01), 2),
                moisture=round(74.5 - (idx * 1.8), 1),
                lst_f=round(82.4 + (idx * 0.4), 1),
                temperature_f=78.5,
                soil_ph=6.4
            )
            db.add(db_plot)
            
        # Create historical records (last 30 days)
        for i in range(30, 0, -1):
            d = datetime.date.today() - datetime.timedelta(days=i)
            record = models.SatelliteRecord(
                farm_id=default_farm.id,
                date=d.strftime("%b %d, %Y"),
                cloud_cover=1.4,
                ndvi_mean=round(0.75 + (random.random() * 0.08), 2),
                ndwi_mean=round(0.31 + (random.random() * 0.06), 2),
                evi_mean=0.56,
                moisture_stress=15,
                rainfall_mm=6.0 if i % 6 == 0 else 0.0,
                temperature_f=81.5
            )
            db.add(record)
            
        # Create irrigation advisory
        advisory = models.IrrigationAdvisory(
            farm_id=default_farm.id,
            status="Active",
            cycle_remaining="01:15:00",
            progress=45,
            water_requirement_liters=18000,
            advisory="Execute secondary drip loop for GITAM plots A1-A6."
        )
        db.add(advisory)
        db.commit()
        db.refresh(default_farm)
        
        user_farms = [default_farm]
        
    return user_farms

@router.post("", response_model=schemas.FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    farm_in: schemas.FarmCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    area_calc = None
    perimeter_calc = None
    if farm_in.polygon and len(farm_in.polygon) > 2:
        area_calc = calculate_polygon_area_hectares(farm_in.polygon)
        perimeter_calc = calculate_polygon_perimeter_m(farm_in.polygon)

    farm = models.Farm(
        user_id=current_user.id,
        name=farm_in.name,
        location=farm_in.location,
        polygon=farm_in.polygon,
        coordinates=farm_in.coordinates,
        crop_type=farm_in.crop_type,
        size_hectares=farm_in.size_hectares,
        area_hectares=area_calc if area_calc is not None else farm_in.size_hectares,
        perimeter_meters=perimeter_calc if perimeter_calc is not None else 0.0,
        health_score=88,
        moisture_stress=15
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)

    # Subdivide farm boundary polygon into management plots of approx 15 cents
    generated_plots = []
    if farm_in.polygon and len(farm_in.polygon) > 2:
        sub_polys = subdivide_polygon_into_cents(farm_in.polygon, target_cents=15.0)
        
        if not sub_polys:
            sub_polys = [farm_in.polygon]
            
        for idx, sub_poly in enumerate(sub_polys):
            sub_area_ha = calculate_polygon_area_hectares(sub_poly)
            sub_area_sqm = sub_area_ha * 10000.0
            sub_cents = sub_area_sqm / 40.4686
            
            slats = [pt[0] for pt in sub_poly]
            slngs = [pt[1] for pt in sub_poly]
            scenter = [sum(slats) / len(slats), sum(slngs) / len(slngs)]
            
            plot_uuid = f"Plot-{idx+1:02d}"
            
            # Generate metrics for this sub-plot
            db_plot = models.ManagementPlot(
                farm_id=farm.id,
                plot_uuid=plot_uuid,
                polygon=sub_poly,
                coordinates=scenter,
                area_sqm=round(sub_area_sqm, 1),
                cents=round(sub_cents, 1),
                ndvi=round(0.74 - (idx * 0.015), 2),
                ndwi=round(0.33 - (idx * 0.01), 2),
                moisture=round(72.5 - (idx * 1.5), 1),
                lst_f=round(81.4 + (idx * 0.4), 1),
                temperature_f=78.5,
                soil_ph=6.4
            )
            db.add(db_plot)

    # Create historical records
    for i in range(30, 0, -1):
        d = datetime.date.today() - datetime.timedelta(days=i)
        record = models.SatelliteRecord(
            farm_id=farm.id,
            date=d.strftime("%b %d, %Y"),
            cloud_cover=round(random.random() * 5, 1),
            ndvi_mean=round(0.7 + (random.random() * 0.15), 2),
            ndwi_mean=round(0.2 + (random.random() * 0.1), 2),
            evi_mean=round(0.5 + (random.random() * 0.1), 2),
            moisture_stress=random.randint(10, 30),
            rainfall_mm=12.0 if i % 7 == 0 else 0.0,
            temperature_f=round(72.0 + (random.random() * 8.0), 1)
        )
        db.add(record)
    
    # Initialize default irrigation record
    advisory = models.IrrigationAdvisory(
        farm_id=farm.id,
        status="Inactive",
        cycle_remaining="00:00:00",
        progress=0,
        water_requirement_liters=25000,
        advisory="Trigger drip cycle of 25,000 liters tomorrow morning."
    )
    db.add(advisory)
    db.commit()

    return farm

@router.post("/upload-shapefile")
def upload_shapefile(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(
            status_code=400, 
            detail="Shapefiles must be uploaded inside a compressed .zip archive containing .shp, .shx, and .dbf."
        )
    
    temp_fd, temp_path = tempfile.mkstemp(suffix=".zip")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        coords, center = parse_zipped_shapefile(temp_path)
        return {
            "polygon": coords,
            "coordinates": center
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.close(temp_fd)
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/{farm_id}", response_model=schemas.FarmResponse)
def get_farm(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_200_OK)
def delete_farm(
    farm_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    db.delete(farm)
    db.commit()
    return {"detail": "Farm deleted successfully."}
