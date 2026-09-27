"use client";

import React, { useState, useEffect } from 'react';
import { Farm } from '@/utils/mockData';
import { useApp } from '@/context/AppContext';
import { Thermometer, Droplet, CloudRain, ShieldAlert, Cpu, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface WhatIfPanelProps {
  farm: Farm;
}

interface SimulationResult {
  simulated_yield_tons_per_acre: number;
  simulated_health_score: number;
  yield_impact_percentage: number;
  moisture_stress_percentage: number;
  disease_risk_level: string;
  recommendations: string[];
  model_type: string;
}

export default function WhatIfPanel({ farm }: WhatIfPanelProps) {
  const { apiConnected } = useApp();
  
  // Slider states
  const [temp, setTemp] = useState(82);
  const [humidity, setHumidity] = useState(65);
  const [rainfall, setRainfall] = useState(0);
  const [irrigation, setIrrigation] = useState(15000);
  
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Client-side offline fallback simulation math (exactly mirrors the backend logic)
  const runOfflineSimulation = () => {
    const base_yield = farm.cropType.toLowerCase().includes("grape") ? 3.2 : 1.8;
    const base_health = 85.0;
    
    // Temperature impact
    let temp_stress = 0.0;
    if (temp > 95.0) {
      temp_stress = (temp - 95.0) * 1.5;
    } else if (temp < 55.0) {
      temp_stress = (55.0 - temp) * 1.0;
    }
    
    // Water impact
    const total_water = rainfall + (irrigation / 1000.0);
    let water_stress = 0.0;
    if (total_water < 10.0) {
      water_stress = (10.0 - total_water) * 2.0;
    } else if (total_water > 60.0) {
      water_stress = (total_water - 60.0) * 1.2;
    }
    
    // Pathogen humidity impact
    let disease_multiplier = 1.0;
    if (humidity > 75.0 && temp > 80.0) {
      disease_multiplier = 1.25;
    }
    
    const yield_reduction = (temp_stress + water_stress) * 0.02;
    const simulated_yield = Math.max(0.5, base_yield * (1.0 - yield_reduction) / disease_multiplier);
    const simulated_health = Math.max(10, Math.round(base_health - (temp_stress + water_stress) * 0.8 - (disease_multiplier - 1.0) * 30));
    
    const recommendations: string[] = [];
    if (temp > 92.0) {
      recommendations.push("Apply micro-sprinklers during peak afternoon heat to reduce canopy temperatures.");
    }
    if (total_water < 15.0) {
      recommendations.push("Drought warning: Increase irrigation drip cycle by 15,000 liters immediately.");
    } else if (total_water > 50.0) {
      recommendations.push("Soil saturation: Suspend scheduled irrigation and verify field drainage channels are clear.");
    }
    if (humidity > 70.0) {
      recommendations.push("High disease risk: Apply biological fungicides (e.g. Bacillus subtilis) to counter Cercospora/Mildew.");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Biophysical parameters are within optimal ranges. Maintain regular cultivation schedule.");
    }
    
    setSimResult({
      simulated_yield_tons_per_acre: parseFloat(simulated_yield.toFixed(2)),
      simulated_health_score: simulated_health,
      yield_impact_percentage: parseFloat((((simulated_yield - base_yield) / base_yield) * 100).toFixed(1)),
      moisture_stress_percentage: Math.min(95, Math.max(5, Math.round(water_stress * 4 + 10))),
      disease_risk_level: disease_multiplier > 1.2 ? "Critical" : humidity > 60 ? "High" : humidity > 40 ? "Moderate" : "Low",
      recommendations,
      model_type: "Local Client Agronomic Simulator"
    });
  };

  // Run simulation whenever sliders change
  useEffect(() => {
    if (apiConnected) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8000/api/analytics/what-if/${farm.id}`, {
        params: {
          temp_f: temp,
          humidity,
          rainfall,
          irrigation
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data) {
          setSimResult(res.data);
        }
      })
      .catch(() => {
        runOfflineSimulation();
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      runOfflineSimulation();
    }
  }, [temp, humidity, rainfall, irrigation, farm, apiConnected]);

  if (!simResult) return null;

  return (
    <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-6 rounded-2xl space-y-6 shadow-sm">
      
      {/* Header title */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-secondary dark:text-surface-container-highest/60 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-primary" />
          <span>WHAT-IF AGRONOMIC SIMULATOR</span>
        </h3>
        <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light mt-1">
          Adjust biophysical sliding parameters to simulate future yield outcomes, moisture stresses, and pathogen risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sliders Control Panel */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider">Simulation Inputs</h4>
          
          {/* Temperature Slider */}
          <div className="space-y-1.5 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-text-secondary dark:text-surface-container-highest/60"><Thermometer className="w-4 h-4 text-error" /> Canopy Temperature</span>
              <span className="font-mono text-text-main dark:text-white">{temp}°F</span>
            </div>
            <input
              type="range" min="40" max="115" step="1"
              value={temp} onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full accent-error bg-surface-container-highest dark:bg-white/10 h-1.5 rounded-full cursor-pointer"
            />
          </div>

          {/* Humidity Slider */}
          <div className="space-y-1.5 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-text-secondary dark:text-surface-container-highest/60"><Droplet className="w-4 h-4 text-primary" /> Relative Humidity</span>
              <span className="font-mono text-text-main dark:text-white">{humidity}%</span>
            </div>
            <input
              type="range" min="10" max="100" step="1"
              value={humidity} onChange={(e) => setHumidity(parseInt(e.target.value))}
              className="w-full accent-primary bg-surface-container-highest dark:bg-white/10 h-1.5 rounded-full cursor-pointer"
            />
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-1.5 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-text-secondary dark:text-surface-container-highest/60"><CloudRain className="w-4 h-4 text-accent" /> Simulated Rainfall</span>
              <span className="font-mono text-text-main dark:text-white">{rainfall} mm</span>
            </div>
            <input
              type="range" min="0" max="80" step="1"
              value={rainfall} onChange={(e) => setRainfall(parseInt(e.target.value))}
              className="w-full accent-accent bg-surface-container-highest dark:bg-white/10 h-1.5 rounded-full cursor-pointer"
            />
          </div>

          {/* Irrigation Slider */}
          <div className="space-y-1.5 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-text-secondary dark:text-surface-container-highest/60"><Droplet className="w-4 h-4 text-success" /> Irrigation Cycle</span>
              <span className="font-mono text-text-main dark:text-white">{irrigation.toLocaleString()} L</span>
            </div>
            <input
              type="range" min="0" max="60000" step="2000"
              value={irrigation} onChange={(e) => setIrrigation(parseInt(e.target.value))}
              className="w-full accent-success bg-surface-container-highest dark:bg-white/10 h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider flex justify-between items-center">
            <span>Simulated Yield Analysis</span>
            <span className="text-[9px] text-primary dark:text-surface-container-highest/40 lowercase font-mono">({simResult.model_type})</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Predicted Yield */}
            <div className="p-4 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-2xl flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase">Simulated Yield</span>
              <div>
                <div className="text-2xl font-extrabold text-text-main dark:text-white">{simResult.simulated_yield_tons_per_acre} t/ac</div>
                <div className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${simResult.yield_impact_percentage >= 0 ? 'text-success' : 'text-error'}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{simResult.yield_impact_percentage >= 0 ? '+' : ''}{simResult.yield_impact_percentage}% delta</span>
                </div>
              </div>
            </div>

            {/* Simulated Health */}
            <div className="p-4 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-2xl flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase">Simulated Health</span>
              <div>
                <div className="text-2xl font-extrabold text-text-main dark:text-white">{simResult.simulated_health_score}%</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/40 mt-1">Expected Canopy NDVI</div>
              </div>
            </div>

            {/* Moisture Stress */}
            <div className="p-4 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-2xl flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase">Moisture Stress</span>
              <div>
                <div className="text-2xl font-extrabold text-text-main dark:text-white">{simResult.moisture_stress_percentage}%</div>
                <div className={`text-[10px] font-semibold mt-1 ${simResult.moisture_stress_percentage > 35 ? 'text-error' : 'text-success'}`}>
                  {simResult.moisture_stress_percentage > 35 ? 'Evapotranspiration stress' : 'Optimal moisture range'}
                </div>
              </div>
            </div>

            {/* Disease Risk */}
            <div className="p-4 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/5 rounded-2xl flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase">Pathogen Risk</span>
              <div>
                <div className={`text-xl font-extrabold uppercase ${
                  simResult.disease_risk_level === 'Low' ? 'text-success' :
                  simResult.disease_risk_level === 'Moderate' ? 'text-warning' : 'text-error animate-pulse'
                }`}>{simResult.disease_risk_level}</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/40 mt-1">Cercospora / Mildew forecast</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory recommendations list */}
      <div className="p-4 bg-primary-light/40 dark:bg-white/5 border border-primary/10 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-primary dark:text-white uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>SIMULATED ADVISORY DIRECTIVES</span>
        </h4>
        <ul className="space-y-2">
          {simResult.recommendations.map((rec, idx) => (
            <li key={idx} className="text-xs flex items-start gap-2 leading-relaxed text-text-main dark:text-surface-container-highest/80 font-light">
              <span className="mt-0.5 text-primary flex-shrink-0">
                {rec.includes("warning") || rec.includes("risk") || rec.includes("saturation") ? <AlertTriangle className="w-3.5 h-3.5 text-warning" /> : <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
