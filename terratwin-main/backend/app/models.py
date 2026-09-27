import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True, nullable=False)
  hashed_password = Column(String, nullable=False)
  full_name = Column(String, nullable=False)
  role = Column(String, default="Farm Manager")
  created_at = Column(DateTime, default=datetime.datetime.utcnow)

  farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
  notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
  settings = relationship("Settings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Farm(Base):
  __tablename__ = "farms"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  name = Column(String, nullable=False)
  location = Column(String, nullable=False)
  polygon = Column(JSON, nullable=True) # GeoJSON structure
  coordinates = Column(JSON, nullable=False) # [lat, lng] center
  crop_type = Column(String, nullable=False)
  size_hectares = Column(Float, nullable=False) # User declared size
  area_hectares = Column(Float, nullable=True) # AI geodetic calculated size
  perimeter_meters = Column(Float, nullable=True) # AI geodetic calculated perimeter
  health_score = Column(Integer, default=85)
  moisture_stress = Column(Integer, default=15)
  created_at = Column(DateTime, default=datetime.datetime.utcnow)

  owner = relationship("User", back_populates="farms")
  satellite_records = relationship("SatelliteRecord", back_populates="farm", cascade="all, delete-orphan")
  prediction_records = relationship("PredictionRecord", back_populates="farm", cascade="all, delete-orphan")
  irrigation_advisories = relationship("IrrigationAdvisory", back_populates="farm", cascade="all, delete-orphan")
  management_plots = relationship("ManagementPlot", back_populates="farm", cascade="all, delete-orphan")


class SatelliteRecord(Base):
  __tablename__ = "satellite_records"

  id = Column(Integer, primary_key=True, index=True)
  farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
  date = Column(String, nullable=False) # e.g. "Aug 24, 2024"
  cloud_cover = Column(Float, default=0.0)
  ndvi_mean = Column(Float, default=0.7)
  ndwi_mean = Column(Float, default=0.3)
  evi_mean = Column(Float, default=0.55)
  moisture_stress = Column(Integer, default=15)
  rainfall_mm = Column(Float, default=0.0)
  temperature_f = Column(Float, default=75.0)

  farm = relationship("Farm", back_populates="satellite_records")


class PredictionRecord(Base):
  __tablename__ = "prediction_records"

  id = Column(Integer, primary_key=True, index=True)
  farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
  target = Column(String, nullable=False) # "yield", "pest", "disease", "harvest_days"
  value = Column(Float, nullable=False) # Numeric prediction
  confidence = Column(Float, default=90.0)
  model_name = Column(String, default="XGBoost v2.0")
  explanation = Column(JSON, nullable=True) # SHAP feature contributions
  created_at = Column(DateTime, default=datetime.datetime.utcnow)

  farm = relationship("Farm", back_populates="prediction_records")


class IrrigationAdvisory(Base):
  __tablename__ = "irrigation_advisories"

  id = Column(Integer, primary_key=True, index=True)
  farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
  status = Column(String, default="Inactive") # "Active", "Inactive"
  cycle_remaining = Column(String, default="00:00:00")
  progress = Column(Integer, default=0)
  water_requirement_liters = Column(Integer, default=15000)
  advisory = Column(String, nullable=True)
  created_at = Column(DateTime, default=datetime.datetime.utcnow)

  farm = relationship("Farm", back_populates="irrigation_advisories")


class Notification(Base):
  __tablename__ = "notifications"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  title = Column(String, nullable=False)
  message = Column(String, nullable=False)
  type = Column(String, default="info") # "info", "warning", "alert", "success"
  read = Column(Boolean, default=False)
  created_at = Column(DateTime, default=datetime.datetime.utcnow)

  user = relationship("User", back_populates="notifications")


class Settings(Base):
  __tablename__ = "settings"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
  stress_alert = Column(Boolean, default=True)
  pest_alert = Column(Boolean, default=True)
  weekly_digest = Column(Boolean, default=False)
  dark_mode = Column(Boolean, default=False)

  user = relationship("User", back_populates="settings")


class ManagementPlot(Base):
  __tablename__ = "management_plots"

  id = Column(Integer, primary_key=True, index=True)
  farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
  plot_uuid = Column(String, unique=True, index=True) # Unique ID (e.g. Plot-A1)
  polygon = Column(JSON, nullable=False) # Geodetic coordinates boundary
  coordinates = Column(JSON, nullable=False) # [lat, lng] center
  area_sqm = Column(Float, nullable=False)
  cents = Column(Float, nullable=False)
  
  # Biophysical indicators
  ndvi = Column(Float, default=0.75)
  ndwi = Column(Float, default=0.32)
  moisture = Column(Float, default=75.0)
  lst_f = Column(Float, default=82.0)
  temperature_f = Column(Float, default=78.0)
  soil_ph = Column(Float, default=6.5)

  farm = relationship("Farm", back_populates="management_plots")
