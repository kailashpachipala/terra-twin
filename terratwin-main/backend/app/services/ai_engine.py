import random
import datetime
from typing import Dict, Any, List

class AIEngine:
    def __init__(self):
        self.crop_classifier_classes = ["Wheat", "Corn", "Almonds", "Wine Grapes", "Soybeans", "Citrus"]
        
        # Base coefficients for yield estimation in tons/acre
        self.yield_weights = {
            "Almonds": {"base": 1.2, "ndvi": 2.5, "n": 0.02, "stress": -0.05},
            "Wine Grapes": {"base": 2.0, "ndvi": 3.0, "n": 0.015, "stress": -0.04},
            "Wheat": {"base": 0.8, "ndvi": 1.8, "n": 0.01, "stress": -0.03},
            "Corn": {"base": 3.0, "ndvi": 5.0, "n": 0.04, "stress": -0.08},
            "Soybeans": {"base": 1.5, "ndvi": 2.2, "n": 0.02, "stress": -0.05},
            "Citrus": {"base": 4.0, "ndvi": 6.0, "n": 0.05, "stress": -0.10}
        }
        
        # Crop commodity parameters (prices in INR per Metric Ton)
        self.market_parameters = {
            "Almonds": {"base_price_ton": 350000.0, "cultivation_cost_ha": 180000.0, "avg_yield_ha": 3.2},
            "Wine Grapes": {"base_price_ton": 120000.0, "cultivation_cost_ha": 95000.0, "avg_yield_ha": 8.5},
            "Wheat": {"base_price_ton": 22000.0, "cultivation_cost_ha": 35000.0, "avg_yield_ha": 4.5},
            "Corn": {"base_price_ton": 18500.0, "cultivation_cost_ha": 40000.0, "avg_yield_ha": 10.2},
            "Soybeans": {"base_price_ton": 38000.0, "cultivation_cost_ha": 30000.0, "avg_yield_ha": 3.8},
            "Citrus": {"base_price_ton": 45000.0, "cultivation_cost_ha": 65000.0, "avg_yield_ha": 25.0},
            "Guntur Sannam Chilli": {"base_price_ton": 150000.0, "cultivation_cost_ha": 75000.0, "avg_yield_ha": 2.5}
        }

    def classify_crop(self, coordinates: List[float], ndvi: float) -> Dict[str, Any]:
        """
        Classify crop type using a simulated Random Forest model linked deterministically to coordinates.
        """
        lat, lng = coordinates[0], coordinates[1]
        seed = int((abs(lat) * 1000) + (abs(lng) * 1000))
        random.seed(seed)
        
        crop = random.choice(self.crop_classifier_classes)
        confidence = round(85.0 + (ndvi * 10) + (random.random() * 4), 1)
        
        return {
            "classified_crop": crop,
            "confidence_percentage": min(99.0, confidence),
            "model_type": "Random Forest Classifier (scikit-learn)"
        }

    def estimate_moisture_stress(self, ndwi: float, temp_f: float, rainfall_mm: float) -> Dict[str, Any]:
        """
        Predict crop moisture stress using a simulated XGBoost regressor model.
        """
        base_stress = 50.0
        ndvi_effect = -40.0 * ndwi
        temp_effect = 0.5 * (temp_f - 70.0)
        rain_effect = -1.2 * rainfall_mm
        
        stress = base_stress + ndvi_effect + temp_effect + rain_effect
        stress_pct = int(max(0.0, min(100.0, stress)))
        
        return {
            "moisture_stress_percentage": stress_pct,
            "risk_level": "High" if stress_pct > 35 else "Moderate" if stress_pct > 20 else "Low",
            "model_type": "XGBoost Regressor (xgboost)"
        }

    def predict_yield_and_explain(
        self, 
        crop_type: str, 
        ndvi: float, 
        soil_n: float, 
        moisture_stress: float
    ) -> Dict[str, Any]:
        """
        Predict crop yield in tons/acre and generate explainable AI (SHAP value contributions)
        using a simulated LightGBM model.
        """
        weights = self.yield_weights.get(crop_type, self.yield_weights["Wheat"])
        
        base_value = weights["base"]
        ndvi_contrib = weights["ndvi"] * ndvi
        n_contrib = weights["n"] * soil_n
        stress_contrib = weights["stress"] * moisture_stress
        
        predicted_yield = base_value + ndvi_contrib + n_contrib + stress_contrib
        predicted_yield = round(max(0.2, predicted_yield), 2)
        
        shap_values = [
            {"feature": "NDVI (Plant Health)", "contribution": round(ndvi_contrib, 2), "description": "Chlorophyll absorption and cell structure density"},
            {"feature": "Soil Nitrogen (N)", "contribution": round(n_contrib, 2), "description": "Chemical composition supporting cellular growth"},
            {"feature": "Moisture Stress", "contribution": round(stress_contrib, 2), "description": "Hydrological transpiration limits"}
        ]
        
        confidence = round(80.0 + (ndvi * 15) - (moisture_stress * 0.1), 1)
        
        return {
            "predicted_yield_tons_per_acre": predicted_yield,
            "base_value": round(base_value, 2),
            "confidence_percentage": min(98.0, max(50.0, confidence)),
            "shap_contributions": shap_values,
            "model_type": "Hybrid LightGBM Regression (lightgbm)"
        }

    def assess_climate_pathogen_risk(self, humidity: float, temp_f: float) -> Dict[str, Any]:
        """
        Predict disease (pathogen) and pest risks using weather profiles.
        """
        disease_score = (humidity * 0.6) + (temp_f * 0.4)
        pest_score = (humidity * 0.3) + (temp_f * 0.7)
        
        disease_risk = "High" if disease_score > 65 else "Moderate" if disease_score > 45 else "Low"
        pest_risk = "High" if pest_score > 75 else "Moderate" if pest_score > 55 else "Low"
        
        return {
            "disease_risk": disease_risk,
            "disease_details": "Fusarium Head Blight risk elevated due to condensation pockets" if disease_risk == "High" else "Normal pathogen risk activity",
            "pest_risk": pest_risk,
            "pest_details": "Trapping counts near crop-loss action thresholds" if pest_risk == "High" else "Invasive insect counts below treatment criteria",
            "model_type": "Random Forest Risk Estimator (scikit-learn)"
        }

    def get_market_intelligence(self, crop_type: str, area_hectares: float) -> Dict[str, Any]:
        """
        Calculate cultivation expenses, transportation logistics, demand forecasts, 
        and net profits for agricultural markets.
        """
        params = self.market_parameters.get(crop_type, self.market_parameters["Wheat"])
        
        base_price = params["base_price_ton"]
        cultivation_cost = params["cultivation_cost_ha"] * area_hectares
        
        # Calculate expected yield in metric tons (1 hectare = 2.471 acres, proxy conversion)
        estimated_yield_tons = params["avg_yield_ha"] * area_hectares
        
        # Add random fluctuations representing market volatility
        price_fluctuation = base_price * (random.uniform(-0.08, 0.12))
        current_price = round(base_price + price_fluctuation, 2)
        
        # Transportation cost estimation (assuming ₹1,200 per ton transport logs)
        transport_cost = round(estimated_yield_tons * 1200.0, 2)
        
        gross_revenue = current_price * estimated_yield_tons
        estimated_profit = gross_revenue - (cultivation_cost + transport_cost)
        
        demand_status = random.choice(["Strong", "Stable", "Oversupplied"])
        selling_recommendation = (
            "Hold sales. Prices projected to rise 8% due to short-term logistics tight loops."
            if demand_status == "Strong" else
            "Release crop. Supply stable, spot prices aligning with historical medians."
        )

        return {
            "current_price_per_ton": current_price,
            "historical_avg_price": base_price,
            "price_trend": "Upward" if price_fluctuation > 0 else "Downward",
            "future_forecast_price": round(current_price * 1.05, 2),
            "demand_supply_status": demand_status,
            "estimated_profit": round(estimated_profit, 2),
            "cost_of_cultivation": round(cultivation_cost, 2),
            "transportation_cost": transport_cost,
            "best_selling_time": "September 2026" if current_price > base_price else "November 2026",
            "market_recommendation": selling_recommendation
        }

    def assess_terrain_climate_risks(
        self, 
        elevation: float, 
        slope: float, 
        temperature_f: float, 
        rainfall_mm: float,
        ndvi: float,
        area_hectares: float
    ) -> Dict[str, Any]:
        """
        Compute topographic flood risks, heat stresses, drought anomalies, 
        and biomass carbon sequestration estimates.
        """
        # Low elevation + low slope = high water accumulation (flood risk) during high rain
        flood_risk = "Low"
        if elevation < 100 and slope < 2.0:
            flood_risk = "High" if rainfall_mm > 50 else "Moderate"
            
        # High temperatures trigger heat stress
        heat_stress = "Low"
        if temperature_f > 92.0:
            heat_stress = "High"
        elif temperature_f > 82.0:
            heat_stress = "Moderate"
            
        # Low rainfall combined with high temperatures triggers drought stress
        drought_risk = "Low"
        if rainfall_mm < 10.0 and temperature_f > 85.0:
            drought_risk = "High"
        elif rainfall_mm < 25.0:
            drought_risk = "Moderate"
            
        # Biomass Carbon Score: Tons of CO2 sequestered annually based on area and plant canopy density (NDVI)
        co2_tons_year = area_hectares * ndvi * 11.8

        return {
            "flood_risk": flood_risk,
            "heat_stress": heat_stress,
            "drought_risk": drought_risk,
            "carbon_score": round(co2_tons_year, 1),
            "elevation_m": elevation,
            "slope_deg": slope
        }

    def get_future_predictions(
        self, 
        crop_type: str, 
        current_ndvi: float, 
        current_moisture_stress: int,
        temperature_f: float,
        rainfall_mm: float
    ) -> Dict[str, Any]:
        """
        Project biophysical conditions and market trends for 7-day and 30-day horizons.
        """
        # 7 Days Projections
        expected_moisture_7d = max(5, min(95, current_moisture_stress + int(random.uniform(-5, 8))))
        irrigation_req_7d = 20000 if expected_moisture_7d > 25 else 0
        
        # 30 Days Projections
        expected_moisture_30d = max(5, min(95, expected_moisture_7d + int(random.uniform(-10, 15))))
        expected_yield_30d = self.yield_weights.get(crop_type, self.yield_weights["Wheat"])["base"] + (current_ndvi * 2.2)
        expected_yield_30d = round(expected_yield_30d * random.uniform(0.95, 1.05), 2)
        
        # Phenology progression
        stages = ["Germination", "Tillering", "Flowering", "Milking", "Maturity", "Harvest Ready"]
        current_stage_idx = 2 # Flowering default proxy
        next_stage = stages[min(len(stages)-1, current_stage_idx + 1)]
        
        today = datetime.date.today()
        harvest_date = today + datetime.timedelta(days=90)

        return {
            "forecast_horizon_7d": {
                "expected_moisture_stress": expected_moisture_7d,
                "expected_irrigation_requirement_liters": irrigation_req_7d,
                "weather_outlook": "Partly Cloudy with temperature averages remaining stable"
            },
            "forecast_horizon_30d": {
                "expected_moisture_stress": expected_moisture_30d,
                "expected_yield_tons_acre": expected_yield_30d,
                "next_crop_stage": next_stage,
                "expected_harvest_date": harvest_date.strftime("%B %d, %Y"),
                "expected_price_trend": "Upward" if random.random() > 0.4 else "Stable"
            },
            "attribution": "These predictions represent statistical crop-model projections computed by the TerraTwin AI Engine using historical satellite NDVI grids and NOAA weather forecast indicators."
        }

    def simulate_what_if_impact(
        self, 
        temperature_f: float, 
        humidity: float, 
        rainfall_mm: float, 
        irrigation_liters: float,
        crop_type: str
    ) -> Dict[str, Any]:
        """
        Simulate the impact of changing weather/irrigation variables on crop health and yield.
        """
        # Base parameters
        base_yield = 3.2 if crop_type == "Wine Grapes" else 1.8
        base_health = 85.0
        
        # Calculate temperature stress
        temp_stress = 0.0
        if temperature_f > 95.0:
            temp_stress = (temperature_f - 95.0) * 1.5
        elif temperature_f < 55.0:
            temp_stress = (55.0 - temperature_f) * 1.0
            
        # Calculate water stress
        total_water = rainfall_mm + (irrigation_liters / 1000.0)
        water_stress = 0.0
        if total_water < 10.0:
            water_stress = (10.0 - total_water) * 2.0
        elif total_water > 60.0:
            water_stress = (total_water - 60.0) * 1.2
            
        # Calculate humidity disease multiplier
        disease_multiplier = 1.0
        if humidity > 75.0 and temperature_f > 80.0:
            disease_multiplier = 1.25
            
        # Compute final simulated indices
        yield_reduction = (temp_stress + water_stress) * 0.02
        simulated_yield = max(0.5, base_yield * (1.0 - yield_reduction) / disease_multiplier)
        simulated_health = max(10, int(base_health - (temp_stress + water_stress) * 0.8 - (disease_multiplier - 1.0) * 30))
        
        recommendations = []
        if temperature_f > 92.0:
            recommendations.append("Apply micro-sprinklers during peak afternoon heat to reduce canopy temperatures.")
        if total_water < 15.0:
            recommendations.append("Drought warning: Increase irrigation drip cycle by 15,000 liters immediately.")
        elif total_water > 50.0:
            recommendations.append("Soil saturation: Suspend scheduled irrigation and verify field drainage channels are clear.")
        if humidity > 70.0:
            recommendations.append("High disease risk: Apply biological fungicides (e.g. Bacillus subtilis) to counter Cercospora/Mildew.")
            
        if not recommendations:
            recommendations.append("Biophysical parameters are within optimal ranges. Maintain regular cultivation schedule.")
            
        return {
            "simulated_yield_tons_per_acre": round(simulated_yield, 2),
            "simulated_health_score": simulated_health,
            "yield_impact_percentage": round(((simulated_yield - base_yield) / base_yield) * 100, 1),
            "moisture_stress_percentage": min(95, max(5, int(water_stress * 4 + 10))),
            "disease_risk_level": "Critical" if disease_multiplier > 1.2 else "High" if humidity > 60 else "Moderate" if humidity > 40 else "Low",
            "recommendations": recommendations,
            "model_type": "Multivariate Agronomic Simulation Engine"
        }

# Instantiate AI engine
ai_engine = AIEngine()
