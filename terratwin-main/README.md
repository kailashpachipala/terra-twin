# TerraTwin - AI-Powered Digital Twin for Smart Agriculture

> **AI-Powered Digital Twin Platform transforming every agricultural field into a living remote sensing database.**

TerraTwin is a precision agriculture management system designed for agronomists, crop managers, and agricultural enterprises. It programmatically clips multi-spectral Sentinel-2, Sentinel-1 SAR, and Landsat satellite imagery to user-drawn field boundaries, computes crop health indices (NDVI, NDWI, EVI), executes XGBoost/LightGBM neural forecasting models (Yield Projection, Pathogen Risks, Evapotranspiration), and explains machine learning decisions using Shapley Additive exPlanations (SHAP value charts).

---

## Technical Stack

* **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS v4, Framer Motion, React Leaflet, Recharts, TanStack Query, Axios, Lucide Icons.
* **Backend**: FastAPI (Python 3.13), SQLAlchemy ORM, Uvicorn, JWT Auth.
* **Database**: SQLite (local fallback) and PostgreSQL/PostGIS (production standard).
* **Remote Sensing**: Google Earth Engine Python API (Sentinel-2, Landsat, MODIS, CHIRPS weather arrays).
* **Machine Learning**: Scikit-Learn (Random Forest), XGBoost, LightGBM (Yield & Stress Regressors), SHAP (Explainable AI values).
* **DevOps**: Docker, Docker Compose, GitHub Actions.

---

## Directory Structure

```
stitch_terratwin_satellite_agriculture_intelligence/
├── frontend/                     # Next.js Single Page Console
│   ├── src/
│   │   ├── app/                  # App router pages (Landing, Login, Dashboard, etc.)
│   │   ├── components/           # Reusable components (Leaflet Map, Recharts Analytics, etc.)
│   │   ├── context/              # Context AppProvider state manager
│   │   └── utils/                # Simulated metrics database
│   ├── Dockerfile
│   └── package.json
│
├── backend/                      # FastAPI Python REST Server
│   ├── app/
│   │   ├── routers/              # Endpoint modules (Auth, Farms, Satellite, Analytics, etc.)
│   │   ├── services/             # GEE client, XGBoost yield inference pipelines
│   │   ├── database.py           # DB engine sessions (SQLite/PostgreSQL switcher)
│   │   ├── models.py             # DB declarations (Users, Farms, Predictions, etc.)
│   │   └── schemas.py            # Pydantic schemas
│   ├── tests/                    # Integration & unit test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml            # Multi-container local execution orchestrator
└── README.md                     # Platform Documentation
```

---

## Local Development Execution

### 1. Run Backend Server
Ensure Python 3.13+ is installed on your machine.
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```
* **API Server URL**: `http://localhost:8000`
* **Swagger Documentation Docs**: `http://localhost:8000/docs`

### 2. Run Frontend Web App
Ensure Node.js 20+ is installed.
```bash
cd frontend
npm install
npm run dev
```
* **Web App URL**: `http://localhost:3000`

---

## Containerized Deployment (Docker)

To build and orchestrate all components in containerized stacks:
```bash
docker compose up --build
```
This spins up:
1. **Frontend client console** at `http://localhost:3000`
2. **FastAPI server backend** at `http://localhost:8000` with hot reload enabled.

---

## API Specifications Summary

* **Authentication**:
  * `POST /api/auth/register` - Create account, initialize default preferences.
  * `POST /api/auth/login` - Verify password, return JWT Access Token.
* **Farms Vector Geometry**:
  * `GET /api/farms` - Query user-owned farms.
  * `POST /api/farms` - Register a farm, upload boundary GeoJSON/KML.
* **Satellite Indices**:
  * `GET /api/satellite/indices/{farm_id}` - Fetch median NDVI, NDWI and EVI from Google Earth Engine.
  * `GET /api/satellite/tiles/{farm_id}/{layer_type}` - Compile false-color MapId tiles for Leaflet layers.
* **AI Engine & Explanations**:
  * `GET /api/analytics/yield/{farm_id}` - Yield tons/acre forecast + SHAP value features.
  * `GET /api/analytics/risks/{farm_id}` - Pathogen disease and pest risk estimates.
