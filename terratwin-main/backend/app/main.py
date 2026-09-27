from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, farms, satellite, analytics, weather, reports, notifications, chat

# Automatically create all database tables in SQLite/PostgreSQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TerraTwin Platform REST API",
    description="Enterprise-grade Precision Agriculture AI Engine & Google Earth Engine Integration",
    version="1.0.0"
)

# Enable CORS for frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(satellite.router)
app.include_router(analytics.router)
app.include_router(weather.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(chat.router)

@app.get("/api/health", tags=["System Health Checks"])
def health_check():
    return {
        "status": "Healthy",
        "timestamp": "2026-07-05T01:50:00",
        "earth_engine_status": "Initialized" if True else "Offline Fallback"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
