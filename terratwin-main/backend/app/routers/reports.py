from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from ..database import get_db
from .. import models, auth

router = APIRouter(prefix="/api/reports", tags=["Reports Exporter"])

@router.get("/download/{farm_id}/{file_format}")
def download_report(
    farm_id: int,
    file_format: str, # "csv", "pdf"
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    if file_format == "csv":
        # Compile CSV buffer
        output = io.StringIO()
        output.write("Parameter,Value\n")
        output.write(f"Farm Name,{farm.name}\n")
        output.write(f"Crop Type,{farm.crop_type}\n")
        output.write(f"Location,{farm.location}\n")
        output.write(f"Size Hectares,{farm.size_hectares}\n")
        output.write(f"Health Score,{farm.health_score}%\n")
        output.write(f"Moisture Stress,{farm.moisture_stress}%\n")
        
        response = StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename=terratwin_report_{farm_id}.csv"
        return response
    else:
        # Simple text representation of PDF report
        pdf_text = f"TERRATWIN PLATFORM - DIGITAL TWIN REPORT\n"
        pdf_text += f"====================================\n"
        pdf_text += f"Farm: {farm.name}\n"
        pdf_text += f"Crop: {farm.crop_type}\n"
        pdf_text += f"Size: {farm.size_hectares} Hectares\n"
        pdf_text += f"Health: {farm.health_score}%\n"
        pdf_text += f"Moisture Stress: {farm.moisture_stress}%\n"

        response = StreamingResponse(
            io.BytesIO(pdf_text.encode("utf-8")),
            media_type="application/pdf"
        )
        response.headers["Content-Disposition"] = f"attachment; filename=terratwin_report_{farm_id}.pdf"
        return response
