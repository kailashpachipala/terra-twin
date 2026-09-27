from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..services.ai_engine import ai_engine

router = APIRouter(prefix="/api/chat", tags=["AI Copilot Assistant"])

# Local helper to map AI chat queries to responses
def get_ai_chat_response(query: str, farm: models.Farm) -> str:
    q = query.lower()
    if "health" in q or "ndvi" in q:
        return f"Based on our digital twin analysis for {farm.name}, the average NDVI is currently {(farm.health_score / 100).toFixed(2) if hasattr(farm.health_score, 'toFixed') else (farm.health_score / 100)} ({farm.health_score}% health index). Soil chlorophyll absorption is solid, but we detect a minor slowdown in southern pockets. Nitrogen application is recommended."
    elif "water" in q or "irrigation" in q or "moisture" in q:
        return f"The current moisture stress is at {farm.moisture_stress}%. For {farm.crop_type}, our XGBoost hydrology model estimates a water requirement of 25,000 liters. Triggering a drip cycle tomorrow morning at 05:00 AM is advised."
    elif "yield" in q or "harvest" in q:
        return f"Our regression model projects a harvest yield of 2.8 tons per acre with a confidence level of 92%. Based on the growth stage, harvest window is estimated in 35 days."
    elif "disease" in q or "pest" in q:
        return f"Fusarium Head Blight risk is elevated due to condensation pockets, but overall pest counts remain below crop-loss action thresholds."
    else:
        return f"Hello! I am your TerraTwin assistant. I can analyze soil chemistry, predict crop yield, schedule irrigation, or evaluate plant health stress for {farm.name}. How can I assist you today?"

@router.post("", response_model=schemas.ChatResponse)
def query_ai_assistant(
    chat_in: schemas.ChatQuery,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(models.Farm).filter(models.Farm.id == chat_in.farm_id, models.Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")
    
    reply = get_ai_chat_response(chat_in.query, farm)
    return {"reply": reply}
