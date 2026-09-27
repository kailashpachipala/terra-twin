"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import AIChat from '@/components/AIChat';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import Terrain3D from '@/components/Terrain3D';
import GrowthStage3D from '@/components/GrowthStage3D';
import WhatIfPanel from '@/components/WhatIfPanel';
import IndiaMap3D from '@/components/IndiaMap3D';
import { MOCK_USER } from '@/utils/mockData';
import { 
  Sprout, 
  Droplet, 
  Activity, 
  LineChart, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  User,
  HeartPulse,
  Scale,
  CloudSun,
  Timer,
  Wind,
  Sun as SunIcon,
  ShieldCheck,
  Compass,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import Leaflet Map dynamically to bypass Next.js SSR document checks
const FarmMap = dynamic(() => import('@/components/FarmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-container-high dark:bg-white/5 flex items-center justify-center flex-col gap-2 rounded-2xl animate-pulse">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-mono">Loading Map Engine...</span>
    </div>
  )
});

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    setUser, 
    farms, 
    selectedFarmId, 
    selectedFarm, 
    activeTab, 
    setActiveTab,
    notifications,
    authLoading
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'rgb' | 'ndvi' | 'ndwi' | 'moisture' | 'temperature' | 'yield'>('rgb');
  const [selectedTimelineDate, setSelectedTimelineDate] = useState('Jul 05, 2026');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [twinViewMode, setTwinViewMode] = useState<'2d' | '3d'>('2d');

  // Protect route: redirect to login if no auth session is validated after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-text-secondary font-mono">Authenticating workstation session...</span>
        </div>
      </div>
    );
  }

  const unreadAlerts = notifications.filter(n => !n.read && (n.type === 'alert' || n.type === 'warning'));
  const selectedPlot = selectedFarm?.management_plots?.find(p => p.plot_uuid === selectedPlotId) || selectedFarm?.management_plots?.[0];

  return (
    <div className="min-h-screen bg-background dark:bg-text-main flex transition-colors duration-300">
      
      {/* Sidebar drawer desktop */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div 
            className="fixed inset-0 bg-text-main/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative flex flex-col w-64 bg-white dark:bg-text-main h-full shadow-2xl z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Workspace content container */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* View Canvas */}
        <main className="flex-grow pt-20 pb-16 px-6 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
          
          {!selectedFarm ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-5 bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-2xl p-8 max-w-md mx-auto shadow-sm"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Sprout className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">Begin Onboarding Your Fields</h3>
              <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light leading-relaxed">
                No digital farm twins are registered to your workspace yet. Click the <span className="font-bold text-primary">Add Farm</span> button in the top menu to onboard your first field boundary!
              </p>
            </motion.div>
          ) : (
            <>
              {/* Dashboard Tab: OVERVIEW */}
              {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              
              {/* Field Metadata Headings */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-bold uppercase tracking-widest font-mono">Digital Farm Twin Console</div>
                  <h2 className="text-2xl font-extrabold text-text-main dark:text-white tracking-tight mt-1">{selectedFarm.name}</h2>
                  <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light mt-0.5">{selectedFarm.location} • {selectedFarm.sizeHectares} Hectares</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl text-xs font-bold shadow-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>July 05, 2026</span>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-light text-warning border border-warning/20 rounded-xl text-xs font-bold shadow-sm animate-pulse-slow">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{unreadAlerts.length} Active Warnings</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bento Grid KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI: Plant Health */}
                <div 
                  onClick={() => setActiveTab('crop-analysis')}
                  className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase tracking-wide">Plant Health Score</span>
                    <Activity className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-text-main dark:text-white">{selectedFarm.healthScore}%</div>
                    <div className="text-[10px] text-success font-semibold flex items-center mt-1">
                      <span>NDVI: {(selectedFarm.healthScore/100).toFixed(2)} • Optimal Growth</span>
                    </div>
                  </div>
                </div>

                {/* KPI: Soil Health */}
                <div 
                  onClick={() => setActiveTab('crop-analysis')}
                  className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase tracking-wide">Soil Nutrients</span>
                    <HeartPulse className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className={`text-2xl font-extrabold ${selectedFarm.soilHealth.status === 'Optimal' ? 'text-primary dark:text-secondary' : 'text-warning'}`}>{selectedFarm.soilHealth.status}</div>
                    <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 mt-1">
                      N: {selectedFarm.soilHealth.n} | P: {selectedFarm.soilHealth.p} | K: {selectedFarm.soilHealth.k} ppm
                    </div>
                  </div>
                </div>

                {/* KPI: Moisture Stress */}
                <div 
                  onClick={() => { setActiveTab('digital-twin'); setMapLayer('moisture'); }}
                  className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase tracking-wide">Moisture Stress</span>
                    <Droplet className={`w-5 h-5 group-hover:scale-110 transition-transform ${selectedFarm.moistureStress > 25 ? 'text-error' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className={`text-3xl font-extrabold ${selectedFarm.moistureStress > 25 ? 'text-error' : 'text-text-main dark:text-white'}`}>{selectedFarm.moistureStress}%</div>
                    <div className={`text-[10px] font-semibold mt-1 ${selectedFarm.moistureStress > 25 ? 'text-error' : 'text-text-secondary dark:text-surface-container-highest/60'}`}>
                      {selectedFarm.moistureStress > 25 ? 'Critical stress in SE Sector' : 'Hydration limits normal'}
                    </div>
                  </div>
                </div>

                {/* KPI: Yield Projection */}
                <div 
                  onClick={() => setActiveTab('crop-analysis')}
                  className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-secondary dark:text-surface-container-highest/60 uppercase tracking-wide">Harvest Projection</span>
                    <LineChart className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-text-main dark:text-white">{selectedFarm.yieldProjection.value} <span className="text-xs font-semibold text-text-secondary">t/ac</span></div>
                    <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 mt-1">
                      Confidence: {selectedFarm.yieldProjection.confidence}% (XGBoost ML)
                    </div>
                  </div>
                </div>

              </div>

              {/* Map & Context Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dynamic Map Component */}
                <div className="lg:col-span-2 h-[450px] relative rounded-2xl overflow-hidden shadow-md">
                  <FarmMap 
                    farm={selectedFarm} 
                    activeLayer={
                      (mapLayer === 'temperature' || mapLayer === 'yield') 
                        ? 'rgb' 
                        : mapLayer
                    } 
                    setActiveLayer={(layer: any) => setMapLayer(layer)} 
                  />
                </div>

                {/* Info Drawers: Weather & Irrigation */}
                <div className="space-y-6">
                  
                  {/* Weather summary */}
                  <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Local Weather Station</h3>
                      <CloudSun className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-extrabold text-text-main dark:text-white">84°F</div>
                      <div className="text-xs">
                        <div className="font-bold dark:text-white">Clear Skies</div>
                        <div className="text-text-secondary dark:text-surface-container-highest/60">Humidity: 24% • Wind: 6mph</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-surface-container-highest dark:border-white/10 pt-3">
                      <div>
                        <div className="text-text-secondary dark:text-surface-container-highest/50">Tomorrow</div>
                        <div className="font-bold dark:text-white mt-0.5">86°F</div>
                      </div>
                      <div>
                        <div className="text-text-secondary dark:text-surface-container-highest/50">Tue</div>
                        <div className="font-bold dark:text-white mt-0.5">85°F</div>
                      </div>
                      <div>
                        <div className="text-text-secondary dark:text-surface-container-highest/50">Wed</div>
                        <div className="font-bold dark:text-white mt-0.5">88°F</div>
                      </div>
                    </div>
                  </div>

                  {/* Irrigation details */}
                  <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl space-y-4 bg-gradient-to-br from-white to-primary-light/10 dark:from-white/5 dark:to-white/0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Hydrological Valve Control</h3>
                      <span className={`w-2 h-2 rounded-full ${selectedFarm.irrigation.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-text-secondary'}`}></span>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/50 uppercase">Current Valve State</div>
                      <div className="text-xl font-extrabold text-primary dark:text-secondary mt-0.5">{selectedFarm.irrigation.status}</div>
                    </div>
                    {selectedFarm.irrigation.status === 'Active' ? (
                      <div className="p-3 bg-white/60 dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl space-y-2">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-primary" /> Cycle remaining</span>
                          <span className="font-mono">{selectedFarm.irrigation.cycleRemaining}</span>
                        </div>
                        <div className="w-full bg-surface-container-highest dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${selectedFarm.irrigation.progress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/40 dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl text-[10px] text-text-secondary dark:text-surface-container-highest/60 leading-normal">
                        Next watering sequence advised at 05:00 AM based on low evapotranspiration forecast.
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Bottom detailed charts */}
              <div className="border-t border-surface-container-highest dark:border-white/10 pt-6">
                <AnalyticsPanel farm={selectedFarm} />
              </div>

            </motion.div>
          )}

          {/* Dashboard Tab: DIGITAL TWIN */}
          {activeTab === 'digital-twin' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-text-main dark:text-white">High Resolution Spatial Digital Twin</h2>
                  <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light">Interact with Sentinel satellite bands clipped to your farm geometry.</p>
                </div>
                {/* 2D / 3D Switcher */}
                <div className="flex bg-background dark:bg-white/5 p-1 rounded-xl border border-surface-container-highest dark:border-white/10">
                  <button 
                    onClick={() => setTwinViewMode('2d')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${twinViewMode === '2d' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary dark:text-surface-container-highest/60 hover:text-white'}`}
                  >
                    2D GIS Map
                  </button>
                  <button 
                    onClick={() => setTwinViewMode('3d')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${twinViewMode === '3d' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary dark:text-surface-container-highest/60 hover:text-white'}`}
                  >
                    3D Terrain Twin
                  </button>
                </div>
              </div>

              {twinViewMode === '2d' ? (
                <div className="h-[600px] rounded-2xl overflow-hidden shadow-md border border-surface-container-highest dark:border-white/10 relative">
                  <FarmMap 
                    farm={selectedFarm} 
                    activeLayer={
                      (mapLayer === 'temperature' || mapLayer === 'yield') 
                        ? 'rgb' 
                        : mapLayer
                    } 
                    setActiveLayer={(layer: any) => setMapLayer(layer)} 
                  />
                </div>
              ) : (
                <Terrain3D 
                  farm={selectedFarm}
                  activeLayer={mapLayer}
                  setActiveLayer={setMapLayer}
                />
              )}

              {/* Timeline date selector */}
              <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Satellite Composite Overpasses (30 Days)</h3>
                  <span className="text-xs font-bold text-primary">{selectedTimelineDate} Composite</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="10"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const dates = [
                        'Jun 05, 2026', 'Jun 08, 2026', 'Jun 12, 2026', 
                        'Jun 15, 2026', 'Jun 19, 2026', 'Jun 22, 2026', 
                        'Jun 26, 2026', 'Jun 29, 2026', 'Jul 02, 2026', 
                        'Jul 05, 2026'
                      ];
                      setSelectedTimelineDate(dates[value - 1]);
                    }}
                    className="w-full h-1.5 bg-surface-container dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-text-secondary dark:text-surface-container-highest/40 font-mono">
                  <span>JUNE 05</span>
                  <span>JUNE 22</span>
                  <span>TODAY (JUL 05)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dashboard Tab: CROP ANALYSIS */}
          {activeTab === 'crop-analysis' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-text-main dark:text-white">AI Crop Diagnostic & Subdivision Lab</h2>
                <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light">Detailed metrics on crop stage, plant health index, and predictive pathogen risks.</p>
              </div>

              {/* 3D Procedural Growth Stage component */}
              <GrowthStage3D currentStage={selectedFarm.growthStage.current} />

              {/* Grid: Plot Selector list + Per-Plot Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Subdivision Plot List */}
                <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl space-y-4 lg:col-span-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Management Subplots</h3>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {selectedFarm.management_plots && selectedFarm.management_plots.length > 0 ? (
                      selectedFarm.management_plots.map((plot) => (
                        <button
                          key={plot.plot_uuid}
                          onClick={() => setSelectedPlotId(plot.plot_uuid)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            (selectedPlot?.plot_uuid === plot.plot_uuid)
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-background dark:bg-white/5 border-surface-container-highest dark:border-white/5 text-text-main dark:text-white hover:border-primary/50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold">{plot.plot_uuid}</div>
                            <div className="text-[9px] text-text-secondary mt-0.5">{plot.cents} Cents • {plot.area_sqm} m²</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-primary dark:text-secondary">NDVI: {plot.ndvi}</div>
                            <div className="text-[9px] text-text-secondary">PH: {plot.soil_ph}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-text-secondary font-light">
                        No management plots loaded.
                      </div>
                    )}
                  </div>
                </div>

                {/* Per-Plot Telemetry Grid */}
                <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 p-5 rounded-2xl space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60 flex justify-between items-center">
                    <span>Telemetry details for {selectedPlot?.plot_uuid || 'Crop Twin'}</span>
                    <span className="text-[10px] text-primary lowercase font-mono">({selectedPlot?.cents} Cents field area)</span>
                  </h3>
                  
                  {selectedPlot ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      
                      {/* Telemetry Item: NDVI */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Vegetation NDVI</span>
                        <div className="text-sm font-extrabold text-primary mt-1">{selectedPlot.ndvi}</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">Sentinel-2 MSI</div>
                      </div>

                      {/* Telemetry Item: NDWI */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Water Index NDWI</span>
                        <div className="text-sm font-extrabold text-accent mt-1">{selectedPlot.ndwi}</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">Sentinel-2 Canopy</div>
                      </div>

                      {/* Telemetry Item: LST */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Land Temp (LST)</span>
                        <div className="text-sm font-extrabold text-error mt-1">{selectedPlot.lst_f}°F</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">MODIS Thermal</div>
                      </div>

                      {/* Telemetry Item: Soil pH */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Soil pH</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">{selectedPlot.soil_ph}</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">Estimated</div>
                      </div>

                      {/* Telemetry Item: Moisture */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Moisture Estimate</span>
                        <div className="text-sm font-extrabold text-success mt-1">{selectedPlot.moisture}%</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">Sentinel-1 SAR VV/VH</div>
                      </div>

                      {/* Telemetry Item: Wind Speed */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Wind Speed</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">14.5 km/h</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">ERA5 Atmosphere</div>
                      </div>

                      {/* Telemetry Item: Wind Dir */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Wind Direction</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">North-East</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">ERA5 Direction</div>
                      </div>

                      {/* Telemetry Item: Solar Irradiance */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Solar Irradiance</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">645 W/m²</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">ERA5 Solar</div>
                      </div>

                      {/* Telemetry Item: Pressure */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Atm Pressure</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">1011.8 hPa</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">ERA5 Surface</div>
                      </div>

                      {/* Telemetry Item: Transpiration */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Transpiration Est</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">4.2 mm/day</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">AI Hydrology Model</div>
                      </div>

                      {/* Telemetry Item: Evaporation */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Evaporation Est</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">2.1 mm/day</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">AI Hydrology Model</div>
                      </div>

                      {/* Telemetry Item: Albedo */}
                      <div className="p-3 bg-background dark:bg-white/5 rounded-xl border border-surface-container-highest dark:border-white/5">
                        <span className="text-[9px] text-text-secondary uppercase font-bold">Albedo</span>
                        <div className="text-sm font-extrabold text-text-main dark:text-white mt-1">0.18</div>
                        <div className="text-[8px] text-text-secondary font-mono mt-0.5">Landsat Reflectance</div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-text-secondary font-light">
                      Select a management subplot from the list to view spatial telemetry parameters.
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* Dashboard Tab: WHAT-IF SIMULATOR */}
          {activeTab === 'what-if' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <WhatIfPanel farm={selectedFarm} />
            </motion.div>
          )}

          {/* Dashboard Tab: NATIONAL TWIN */}
          {activeTab === 'national-twin' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-text-main dark:text-white">National 3D Agro-Climatic Twin</h2>
                <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light">
                  Animate the seasonal crop health indices (NDVI) across major state territories of India.
                </p>
              </div>
              <IndiaMap3D />
            </motion.div>
          )}

          {/* Dashboard Tab: REPORTS */}
          {activeTab === 'reports' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <ReportsView farm={selectedFarm} />
            </motion.div>
          )}

          {/* Dashboard Tab: AI ASSISTANT */}
          {activeTab === 'ai-assistant' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <AIChat farm={selectedFarm} />
            </motion.div>
          )}

          {/* Dashboard Tab: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingsView />
            </motion.div>
          )}

          {/* Dashboard Tab: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <SettingsView />
            </motion.div>
          )}

            </>
          )}
        </main>
      </div>

    </div>
  );
}
