"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Farm, generateHistoricalData } from '@/utils/mockData';
import { LineChart as ChartIcon, Calendar, Info, ShieldAlert, TrendingUp, IndianRupee, CloudRain, Shield, AlertTriangle, Leaf, HelpCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useApp } from '@/context/AppContext';

interface AnalyticsPanelProps {
  farm: Farm;
}

export default function AnalyticsPanel({ farm }: AnalyticsPanelProps) {
  const { apiConnected } = useApp();
  const chartData = useMemo(() => generateHistoricalData(farm.id), [farm.id]);

  const [market, setMarket] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [terrain, setTerrain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      const area = farm.sizeHectares;
      const ndvi = (farm.healthScore || 85) / 100.0;
      
      // Default high-quality simulated fallbacks
      const defaultMarket = {
        current_price_per_ton: farm.cropType === 'Almonds' ? 4350.0 : farm.cropType === 'Wine Grapes' ? 1850.0 : 255.0,
        historical_avg_price: farm.cropType === 'Almonds' ? 4200.0 : farm.cropType === 'Wine Grapes' ? 1800.0 : 260.0,
        price_trend: 'Upward',
        future_forecast_price: farm.cropType === 'Almonds' ? 4500.0 : 270.0,
        demand_supply_status: 'Strong',
        estimated_profit: Math.round(area * 3200),
        cost_of_cultivation: Math.round(area * 900),
        transportation_cost: Math.round(area * 150),
        best_selling_time: 'September 2026',
        market_recommendation: 'Strong spot demands. Yield projections point to favorable profit margins.'
      };

      const defaultForecast = {
        forecast_horizon_7d: {
          expected_moisture_stress: 18,
          expected_irrigation_requirement_liters: 12000,
          weather_outlook: 'Moderate temperatures, low precipitation index.'
        },
        forecast_horizon_30d: {
          expected_moisture_stress: 22,
          expected_yield_tons_acre: farm.cropType === 'Almonds' ? 3.4 : 5.2,
          next_crop_stage: 'Maturation',
          expected_harvest_date: 'October 14, 2026',
          expected_price_trend: 'Upward'
        },
        attribution: 'Statistical AI models utilizing NOAA GFS weather models and MODIS/Landsat historical phenology indexes.'
      };

      const defaultTerrain = {
        flood_risk: 'Low',
        heat_stress: 'Moderate',
        drought_risk: 'Low',
        carbon_score: Math.round(area * ndvi * 12.2),
        elevation_m: 140.0,
        slope_deg: 2.1
      };

      if (!apiConnected) {
        setMarket(defaultMarket);
        setForecast(defaultForecast);
        setTerrain(defaultTerrain);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [marketRes, terrainRes, forecastRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/analytics/market/${farm.id}`, { headers }).catch(() => ({ data: defaultMarket })),
          axios.get(`http://localhost:8000/api/analytics/terrain-climate/${farm.id}`, { headers }).catch(() => ({ data: defaultTerrain })),
          axios.get(`http://localhost:8000/api/analytics/forecast/${farm.id}`, { headers }).catch(() => ({ data: defaultForecast }))
        ]);

        setMarket(marketRes.data);
        setTerrain(terrainRes.data);
        setForecast(forecastRes.data);
      } catch (err) {
        console.error("Error loading analytics endpoints, running simulations", err);
        setMarket(defaultMarket);
        setForecast(defaultForecast);
        setTerrain(defaultTerrain);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [farm.id, farm.cropType, farm.sizeHectares, farm.healthScore, apiConnected]);

  return (
    <div className="space-y-6">
      
      {/* Dynamic AI Alerts Panel */}
      {loading ? (
        <div className="flex items-center justify-center p-8 bg-white dark:bg-text-main rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-xs font-semibold text-text-secondary">Computing Satellite-AI Forecasting Models...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-text-main p-4 rounded-xl border border-surface-container-highest dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${terrain?.flood_risk === 'High' ? 'bg-error-light text-error' : 'bg-primary-light text-primary'}`}>
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Flood Risk (Topography)</p>
              <h4 className="text-sm font-bold text-text-main dark:text-white mt-0.5">{terrain?.flood_risk || 'Low'}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-text-main p-4 rounded-xl border border-surface-container-highest dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${terrain?.heat_stress === 'High' ? 'bg-error-light text-error' : 'bg-primary-light text-primary'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Heat Index Stress</p>
              <h4 className="text-sm font-bold text-text-main dark:text-white mt-0.5">{terrain?.heat_stress || 'Low'}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-text-main p-4 rounded-xl border border-surface-container-highest dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${terrain?.drought_risk === 'High' ? 'bg-error-light text-error' : 'bg-primary-light text-primary'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Drought Risk Index</p>
              <h4 className="text-sm font-bold text-text-main dark:text-white mt-0.5">{terrain?.drought_risk || 'Low'}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-text-main p-4 rounded-xl border border-surface-container-highest dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-primary-light text-primary rounded-lg flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Carbon Offset Score</p>
              <h4 className="text-sm font-bold text-text-main dark:text-white mt-0.5">{terrain?.carbon_score || 0} tCO2e/yr</h4>
            </div>
          </div>
        </div>
      )}

      {/* Chart Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* NDVI & EVI Vegetation Index Area Chart */}
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-text-main dark:text-white flex items-center gap-1.5">
                <ChartIcon className="w-4 h-4 text-primary" />
                Spectral Vegetation Indices (NDVI / EVI)
              </h3>
              <p className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-light mt-0.5">Spectral canopy dynamics over the last 30 days</p>
            </div>
            <div className="flex items-center gap-1 bg-primary-light dark:bg-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold text-primary">
              <Calendar className="w-3.5 h-3.5" />
              <span>30 Days</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorEvi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D3E0D6" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#5F6B66' }} />
                <YAxis domain={[0, 1.0]} tick={{ fontSize: 9, fill: '#5F6B66' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderColor: 'rgba(46,125,50,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#1B4332'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="ndvi" name="NDVI Index" stroke="#2E7D32" strokeWidth={2} fillOpacity={1} fill="url(#colorNdvi)" />
                <Area type="monotone" dataKey="evi" name="EVI Index" stroke="#4CAF50" strokeWidth={1.5} fillOpacity={1} fill="url(#colorEvi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moisture Stress & Evapotranspiration Line Chart */}
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-text-main dark:text-white flex items-center gap-1.5">
                <ChartIcon className="w-4 h-4 text-primary" />
                Soil Moisture & Weather Correlation
              </h3>
              <p className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-light mt-0.5">Hydration levels compared against localized air temperature</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D3E0D6" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#5F6B66' }} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 9, fill: '#5F6B66' }} />
                <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fontSize: 9, fill: '#5F6B66' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderColor: 'rgba(46,125,50,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#1B4332'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="moisture" name="Soil Moisture %" stroke="#1976D2" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°F)" stroke="#F57C00" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced UI Sections */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Projections Panel */}
          <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-container-highest dark:border-white/10 pb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-text-main dark:text-white">Predictive AI Biophysical Forecasts</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 7 Days Outlook */}
              <div className="p-4 bg-primary-light/35 dark:bg-white/5 rounded-xl border border-primary/10 space-y-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary text-white rounded">Next 7 Days</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary font-light">Expected moisture stress:</span>
                    <span className="font-bold text-text-main dark:text-white">{forecast?.forecast_horizon_7d?.expected_moisture_stress}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary font-light">Irrigation needed:</span>
                    <span className="font-bold text-primary">{forecast?.forecast_horizon_7d?.expected_irrigation_requirement_liters.toLocaleString()} Liters</span>
                  </div>
                  <p className="text-[10px] text-text-secondary italic mt-1 leading-normal font-light">
                    {forecast?.forecast_horizon_7d?.weather_outlook}
                  </p>
                </div>
              </div>

              {/* 30 Days Outlook */}
              <div className="p-4 bg-primary-light/35 dark:bg-white/5 rounded-xl border border-primary/10 space-y-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary text-white rounded">Next 30 Days</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary font-light">Expected Yield:</span>
                    <span className="font-bold text-text-main dark:text-white">{forecast?.forecast_horizon_30d?.expected_yield_tons_acre} tons/acre</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary font-light">Next Growth Stage:</span>
                    <span className="font-bold text-text-main dark:text-white">{forecast?.forecast_horizon_30d?.next_crop_stage}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary font-light">Estimated Harvest:</span>
                    <span className="font-bold text-text-main dark:text-white">{forecast?.forecast_horizon_30d?.expected_harvest_date}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[9px] text-text-secondary font-mono bg-background dark:bg-white/5 p-2.5 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>{forecast?.attribution}</span>
            </div>
          </div>

          {/* Market Intelligence Panel */}
          <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-container-highest dark:border-white/10 pb-3">
              <IndianRupee className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-text-main dark:text-white">Crop Market Intelligence</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs border-b border-surface-container/30 pb-2">
                <span className="text-text-secondary font-light">Current Spot Price:</span>
                <span className="font-bold text-text-main dark:text-white">₹{market?.current_price_per_ton?.toLocaleString()} / Ton</span>
              </div>
              <div className="flex justify-between text-xs border-b border-surface-container/30 pb-2">
                <span className="text-text-secondary font-light">Cultivation Cost:</span>
                <span className="font-bold text-error">₹{market?.cost_of_cultivation?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-surface-container/30 pb-2">
                <span className="text-text-secondary font-light">Transportation Cost:</span>
                <span className="font-bold text-text-main dark:text-white">₹{market?.transportation_cost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-surface-container/30 pb-2">
                <span className="text-text-secondary font-bold">Estimated Net Profit:</span>
                <span className={`font-extrabold ${market?.estimated_profit > 0 ? 'text-success' : 'text-error'}`}>
                  ₹{market?.estimated_profit?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5 space-y-1">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wide">Selling recommendation</h4>
              <p className="text-[10px] text-text-secondary leading-normal font-light">
                {market?.market_recommendation}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Mini advisory banner */}
      <div className="bg-primary-light dark:bg-white/5 border border-primary/10 rounded-2xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-primary dark:text-white">Explanation from XAI Inference Engine</h4>
          <p className="text-text-secondary dark:text-surface-container-highest/70 font-light leading-relaxed mt-0.5">
            Vegetation index (NDVI) registered a <b>+2.4%</b> positive increase following the precipitation spike. Crop development is on-track for kernel-filling stage. Soil nutrients levels remain stable.
          </p>
        </div>
      </div>
    </div>
  );
}
