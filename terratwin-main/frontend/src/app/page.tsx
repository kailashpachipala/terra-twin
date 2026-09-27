"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  Map, 
  Brain, 
  LineChart, 
  Droplet, 
  Activity, 
  ShieldAlert, 
  Cpu, 
  ArrowRight,
  Database,
  Globe,
  Gauge
} from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-primary" />,
      title: "Crop Classification",
      desc: "Automatically map and identify crop varietals across broad acreage using Sentinel-2 multi-spectral bands."
    },
    {
      icon: <Activity className="w-8 h-8 text-primary" />,
      title: "Plant Health Indexing",
      desc: "Track NDVI, EVI, and GNDVI trends to identify plant anomalies and crop stresses before they become visible to the eye."
    },
    {
      icon: <Gauge className="w-8 h-8 text-primary" />,
      title: "Soil Nutrients Profiling",
      desc: "Simulate nitrogen, phosphorus, potassium, and pH distribution maps using deep neural network estimation models."
    },
    {
      icon: <Droplet className="w-8 h-8 text-primary" />,
      title: "Moisture Stress Analysis",
      desc: "Monitor canopy water content and root-zone water stress with Sentinel-1 SAR and Sentinel-2 NDWI metrics."
    },
    {
      icon: <Map className="w-8 h-8 text-primary" />,
      title: "Growth Stage Detection",
      desc: "Pinpoint crop development milestones (Veraison, Kernel Filling, Soft Dough) to dynamically forecast harvest timing."
    },
    {
      icon: <LineChart className="w-8 h-8 text-primary" />,
      title: "Yield & Harvest Projections",
      desc: "Predict tonnage per acre weeks in advance using hybrid XGBoost regression models calibrated on historical weather."
    },
    {
      icon: <Droplet className="w-8 h-8 text-primary" />,
      title: "Irrigation Advisory",
      desc: "Get intelligent schedule suggestions calculated from local evapotranspiration, humidity, and forecast rainfall."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Satellite Intelligence & XAI",
      desc: "Verify AI decisions with Explainable AI (SHAP value summaries), outlining key contributors behind every yield prediction."
    }
  ];

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="fixed inset-0 bg-text-main z-50 flex flex-col items-center justify-center text-background"
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Pulsing logo */}
              <img 
                src="/logo.jpg" 
                alt="TerraTwin Logo" 
                className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-primary/20 border border-secondary/20 mb-6 animate-pulse" 
              />
              <motion.h1 
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.5em", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl font-extrabold tracking-[0.5em] text-white font-mono"
              >
                TERRATWIN
              </motion.h1>
              <div className="w-32 h-1 bg-white/20 rounded-full mt-4 overflow-hidden relative">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="absolute h-full w-1/3 bg-secondary"
                />
              </div>
              <p className="text-secondary-text text-sm mt-3 uppercase tracking-widest font-sans font-medium text-surface-container/60">
                AI-Powered Digital Twin Platform
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Layout */}
      {!loading && (
        <div className="min-h-screen bg-background text-text-main flex flex-col">
          {/* Header */}
          <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-surface-container-highest z-40">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="TerraTwin Logo" 
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-surface-container-highest" 
                />
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-primary">TerraTwin</h1>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Smart Agriculture</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-8 font-medium">
                <a href="#features" className="text-text-secondary hover:text-primary transition-colors">Features</a>
                <a href="#technology" className="text-text-secondary hover:text-primary transition-colors">Technology</a>
                <a href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors">How It Works</a>
              </nav>

              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="px-5 py-2.5 rounded-full border border-primary/20 text-primary font-semibold hover:bg-primary-light hover:border-primary/40 transition-all text-sm"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold shadow-md shadow-primary/10 transition-all text-sm"
                >
                  Start Monitoring
                </Link>
              </div>
            </div>
          </header>

          {/* Hero Banner */}
          <section className="relative min-h-[85vh] flex items-center bg-text-main overflow-hidden py-16">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply" 
              style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=2000')` 
              }}
            />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            
            <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md text-secondary font-semibold text-xs tracking-wider uppercase">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  Next-Gen Remote Sensing
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Transform Every Farm Into a <span className="text-secondary">Living Digital Twin</span>
                </h2>
                <p className="text-lg sm:text-xl text-surface-container-highest/80 max-w-2xl font-light">
                  Monitor crop health, assess soil metrics, evaluate hydration stress, and project harvest yields in real-time with satellite imagery and Artificial Intelligence.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link 
                    href="/register" 
                    className="px-8 py-4 rounded-full bg-secondary hover:bg-secondary/90 text-text-main font-bold shadow-lg shadow-secondary/15 transition-all text-base flex items-center gap-2 group"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/login" 
                    className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold backdrop-blur-sm border border-white/20 transition-all text-base"
                  >
                    Request Demo
                  </Link>
                </div>

                {/* Micro metrics panel */}
                <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 mt-12 max-w-lg">
                  <div>
                    <div className="text-3xl font-extrabold text-white">96%</div>
                    <div className="text-xs text-surface-container-highest/60 uppercase font-medium mt-1">AI Classification Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white">10m</div>
                    <div className="text-xs text-surface-container-highest/60 uppercase font-medium mt-1">Spatial Resolution</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white">Daily</div>
                    <div className="text-xs text-surface-container-highest/60 uppercase font-medium mt-1">Satellite Overpass Updates</div>
                  </div>
                </div>
              </div>

              {/* Side dashboard teaser graphic */}
              <div className="lg:col-span-5 hidden lg:block">
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden bg-text-main/80 backdrop-blur-lg"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs font-mono text-white/40">terratwin-console-v2.0</span>
                  </div>

                  <div className="space-y-4">
                    {/* Simulated Farm Card */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-secondary">
                          <Sprout className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Selected Area</div>
                          <div className="text-sm font-bold text-white">Plot A-42 Grapes</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">Active</span>
                    </div>

                    {/* Simulating GEE Satellite loading */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>NDVI Vegetation Index</span>
                        <span className="text-secondary font-bold">0.82 (Healthy)</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[82%]"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-xs text-white/40">Soil Moisture</div>
                        <div className="text-lg font-bold text-white mt-1">Optimal</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-xs text-white/40">Yield Projection</div>
                        <div className="text-lg font-bold text-white mt-1">4.2 t/ac</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle decorative mesh */}
                  <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-primary/20 rounded-full filter blur-2xl pointer-events-none"></div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section id="features" className="py-24 max-w-7xl mx-auto px-6 w-full">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Core Capabilities</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main">
                All-in-One AI Satellite Farm Intelligence
              </h3>
              <p className="text-text-secondary mt-4 font-light text-lg">
                TerraTwin replaces guesswork with real-time remote physical modeling. Monitor water stress, predict yields, and detect diseases using global earth observation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feat, index) => (
                <div 
                  key={index}
                  className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col h-72 justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center shadow-inner border border-primary/5">
                      {feat.icon}
                    </div>
                    <h4 className="text-xl font-bold text-text-main">{feat.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technology & GEE Pipeline section */}
          <section id="technology" className="py-24 bg-surface-container border-y border-surface-container-highest">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Data Pipelines</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
                  Powered by Enterprise Earth Observation
                </h3>
                <p className="text-text-secondary font-light leading-relaxed">
                  We programmatically retrieve spatial arrays from **Google Earth Engine API** representing Sentinel-2, Sentinel-1 SAR, Landsat-8, and MODIS satellites.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main text-sm">Cloud-free composites</h4>
                      <p className="text-xs text-text-secondary font-light mt-0.5">Automated pixel quality mapping and cloud-masking algorithms ensure clear visual representations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main text-sm">PostGIS Spatial Database</h4>
                      <p className="text-xs text-text-secondary font-light mt-0.5">High-speed storage of GeoJSON and KML polygon boundaries with full geographical query support.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology architecture graphic */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-surface-container-highest space-y-3 flex flex-col justify-between">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">1</div>
                  <h4 className="font-bold text-text-main text-sm">Satellite Capture</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-light">Retrieves radar (Sentinel-1) and optical (Sentinel-2) layers.</p>
                  <span className="text-[10px] font-mono font-bold bg-secondary-light text-primary px-2 py-0.5 rounded self-start">Earth Engine API</span>
                </div>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-surface-container-highest space-y-3 flex flex-col justify-between">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">2</div>
                  <h4 className="font-bold text-text-main text-sm">AI Hydrology & Yield</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-light">Estimates moisture stress levels and calculates forecast yields.</p>
                  <span className="text-[10px] font-mono font-bold bg-secondary-light text-primary px-2 py-0.5 rounded self-start">XGBoost / ML Engine</span>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-surface-container-highest space-y-3 flex flex-col justify-between">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">3</div>
                  <h4 className="font-bold text-text-main text-sm">Digital Twin Rendering</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-light">Interactive Leaflet visualization maps overlays to real coordinates.</p>
                  <span className="text-[10px] font-mono font-bold bg-secondary-light text-primary px-2 py-0.5 rounded self-start">Next.js Leaflet</span>
                </div>
              </div>
            </div>
          </section>

          {/* How it works section */}
          <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 w-full">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Onboarding</h2>
              <h3 className="text-3xl font-extrabold text-text-main tracking-tight">Onboard Your Farm in 3 Simple Steps</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Process line connector for desktop */}
              <div className="hidden md:block absolute top-1/2 left-12 right-12 h-[1px] bg-surface-container-highest -translate-y-12 z-0" />

              <div className="text-center relative z-10 space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  1
                </div>
                <h4 className="font-bold text-lg text-text-main">Draw or Upload Polygon</h4>
                <p className="text-sm text-text-secondary font-light max-w-xs mx-auto leading-relaxed">
                  Register your field boundaries on our interactive map or drag-and-drop a GeoJSON or KML file.
                </p>
              </div>

              <div className="text-center relative z-10 space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  2
                </div>
                <h4 className="font-bold text-lg text-text-main">AI Processes Data</h4>
                <p className="text-sm text-text-secondary font-light max-w-xs mx-auto leading-relaxed">
                  Our system triggers Google Earth Engine tasks to query historical band profiles, and executes ML models.
                </p>
              </div>

              <div className="text-center relative z-10 space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  3
                </div>
                <h4 className="font-bold text-lg text-text-main">Optimize and Act</h4>
                <p className="text-sm text-text-secondary font-light max-w-xs mx-auto leading-relaxed">
                  View your farm's digital twin, adjust irrigation cycles, track fertilizer requirements, and increase overall profitability.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-text-main text-white mt-auto border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">TerraTwin</span>
                </div>
                <p className="text-xs text-surface-container-highest/60 font-light leading-relaxed">
                  Advanced Satellite remote sensing and AI Digital Twins for smart agro-industrial enterprise operations.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Features</h5>
                <ul className="space-y-2 text-xs text-surface-container-highest/60 font-light">
                  <li><Link href="/login" className="hover:text-secondary transition-colors">Digital Twin Viewer</Link></li>
                  <li><Link href="/login" className="hover:text-secondary transition-colors">Yield Predictor</Link></li>
                  <li><Link href="/login" className="hover:text-secondary transition-colors">Moisture Hydrology</Link></li>
                  <li><Link href="/login" className="hover:text-secondary transition-colors">Explainable AI Insights</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Legal</h5>
                <ul className="space-y-2 text-xs text-surface-container-highest/60 font-light">
                  <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-secondary transition-colors">Security Details</a></li>
                  <li><a href="#" className="hover:text-secondary transition-colors">SLA Agreement</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">TerraTwin Enterprise</h5>
                <p className="text-xs text-surface-container-highest/60 font-light leading-relaxed">
                  Contact our sales and integrations team for API licenses and high-resolution commercial satellite tasking.
                </p>
                <div className="mt-4 text-xs font-bold text-secondary font-mono">
                  sales@terratwin.ai
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 border-t border-white/5 text-center text-xs text-surface-container-highest/30 font-mono">
              © {new Date().getFullYear()} TerraTwin Platform. All Rights Reserved. Built with Next.js & FastAPI.
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
