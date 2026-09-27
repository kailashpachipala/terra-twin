import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_engine import ai_engine

class TestTerraTwinAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "Healthy")

    def test_ai_crop_classification(self):
        res = ai_engine.classify_crop([37.8044, -121.2758], 0.82)
        self.assertIn("classified_crop", res)
        self.assertGreater(res["confidence_percentage"], 80)
        self.assertEqual(res["model_type"], "Random Forest Classifier (scikit-learn)")

    def test_ai_yield_projection(self):
        res = ai_engine.predict_yield_and_explain("Almonds", 0.94, 42.0, 12.0)
        self.assertIn("predicted_yield_tons_per_acre", res)
        self.assertGreater(res["predicted_yield_tons_per_acre"], 1.0)
        self.assertEqual(len(res["shap_contributions"]), 3)
        self.assertEqual(res["model_type"], "Hybrid LightGBM Regression (lightgbm)")

    def test_ai_moisture_stress(self):
        res = ai_engine.estimate_moisture_stress(0.35, 84.0, 0.0)
        self.assertIn("moisture_stress_percentage", res)
        self.assertIn(res["risk_level"], ["Low", "Moderate", "High"])

if __name__ == "__main__":
    unittest.main()
