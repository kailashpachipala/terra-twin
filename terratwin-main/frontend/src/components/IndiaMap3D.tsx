"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, RotateCw, Sparkles, Calendar, Heart } from 'lucide-react';

interface StateCropData {
  name: string;
  crop: string;
  lat: number;
  lng: number;
  monthlyNdvi: number[]; // 12 months index levels
}

const INDIAN_STATES: StateCropData[] = [
  {
    name: "Andhra Pradesh",
    crop: "Chilli & Rice",
    lat: 15.91,
    lng: 79.74,
    monthlyNdvi: [0.55, 0.72, 0.78, 0.52, 0.45, 0.48, 0.62, 0.70, 0.75, 0.72, 0.65, 0.58]
  },
  {
    name: "Punjab",
    crop: "Wheat & Paddy",
    lat: 31.14,
    lng: 75.34,
    monthlyNdvi: [0.68, 0.85, 0.90, 0.48, 0.35, 0.40, 0.65, 0.75, 0.72, 0.58, 0.50, 0.58]
  },
  {
    name: "Uttar Pradesh",
    crop: "Sugarcane",
    lat: 26.84,
    lng: 80.94,
    monthlyNdvi: [0.72, 0.75, 0.78, 0.70, 0.65, 0.68, 0.74, 0.78, 0.82, 0.80, 0.76, 0.74]
  },
  {
    name: "Maharashtra",
    crop: "Cotton & Jowar",
    lat: 19.75,
    lng: 75.71,
    monthlyNdvi: [0.50, 0.52, 0.48, 0.38, 0.35, 0.42, 0.60, 0.72, 0.78, 0.70, 0.62, 0.55]
  },
  {
    name: "West Bengal",
    crop: "Rice & Jute",
    lat: 22.98,
    lng: 87.85,
    monthlyNdvi: [0.60, 0.64, 0.68, 0.55, 0.50, 0.62, 0.78, 0.85, 0.88, 0.82, 0.74, 0.65]
  },
  {
    name: "Karnataka",
    crop: "Ragi & Maize",
    lat: 15.31,
    lng: 75.71,
    monthlyNdvi: [0.52, 0.58, 0.65, 0.50, 0.42, 0.48, 0.62, 0.70, 0.74, 0.68, 0.60, 0.55]
  },
  {
    name: "Tamil Nadu",
    crop: "Rice & Groundnut",
    lat: 11.12,
    lng: 78.65,
    monthlyNdvi: [0.58, 0.62, 0.68, 0.52, 0.45, 0.48, 0.60, 0.68, 0.72, 0.70, 0.64, 0.58]
  },
  {
    name: "Gujarat",
    crop: "Cotton & Groundnut",
    lat: 22.25,
    lng: 71.19,
    monthlyNdvi: [0.48, 0.52, 0.55, 0.42, 0.35, 0.40, 0.58, 0.65, 0.70, 0.62, 0.55, 0.50]
  },
  {
    name: "Rajasthan",
    crop: "Mustard & Bajra",
    lat: 27.02,
    lng: 74.21,
    monthlyNdvi: [0.42, 0.48, 0.52, 0.35, 0.28, 0.30, 0.45, 0.52, 0.55, 0.48, 0.42, 0.40]
  },
  {
    name: "Madhya Pradesh",
    crop: "Soybeans & Gram",
    lat: 22.97,
    lng: 78.65,
    monthlyNdvi: [0.55, 0.62, 0.68, 0.48, 0.38, 0.42, 0.60, 0.72, 0.76, 0.68, 0.60, 0.55]
  },
  {
    name: "Bihar",
    crop: "Rice & Maize",
    lat: 25.09,
    lng: 85.31,
    monthlyNdvi: [0.58, 0.62, 0.65, 0.52, 0.45, 0.48, 0.64, 0.72, 0.75, 0.68, 0.62, 0.58]
  },
  {
    name: "Odisha",
    crop: "Rice & Pulses",
    lat: 20.95,
    lng: 84.80,
    monthlyNdvi: [0.55, 0.60, 0.64, 0.50, 0.42, 0.48, 0.62, 0.70, 0.74, 0.68, 0.62, 0.58]
  },
  {
    name: "Assam",
    crop: "Tea & Rice",
    lat: 26.20,
    lng: 92.93,
    monthlyNdvi: [0.65, 0.72, 0.76, 0.68, 0.60, 0.65, 0.78, 0.82, 0.85, 0.80, 0.74, 0.68]
  },
  {
    name: "Kerala",
    crop: "Spices & Coconut",
    lat: 10.85,
    lng: 76.27,
    monthlyNdvi: [0.70, 0.75, 0.78, 0.72, 0.68, 0.70, 0.78, 0.82, 0.85, 0.82, 0.78, 0.74]
  },
  {
    name: "Haryana",
    crop: "Wheat & Mustard",
    lat: 29.05,
    lng: 76.08,
    monthlyNdvi: [0.62, 0.78, 0.82, 0.45, 0.35, 0.40, 0.60, 0.70, 0.68, 0.55, 0.50, 0.55]
  }
];

// Reference India boundary polygon for point-in-polygon landmass tests
const DETAILED_INDIA_BORDER = [
  { lat: 37.0, lng: 74.5 }, { lat: 35.8, lng: 76.5 }, { lat: 34.8, lng: 79.5 },
  { lat: 32.8, lng: 78.8 }, { lat: 31.0, lng: 78.3 }, { lat: 30.2, lng: 80.4 },
  { lat: 28.8, lng: 81.3 }, { lat: 27.4, lng: 85.2 }, { lat: 26.5, lng: 88.0 },
  { lat: 27.8, lng: 88.2 }, { lat: 27.2, lng: 88.9 }, { lat: 27.9, lng: 91.5 },
  { lat: 28.3, lng: 94.0 }, { lat: 28.5, lng: 96.2 }, { lat: 27.0, lng: 97.2 },
  { lat: 26.2, lng: 95.2 }, { lat: 24.2, lng: 94.3 }, { lat: 22.0, lng: 93.0 },
  { lat: 22.0, lng: 92.2 }, { lat: 23.2, lng: 91.3 }, { lat: 24.0, lng: 91.8 },
  { lat: 25.1, lng: 92.0 }, { lat: 25.2, lng: 89.8 }, { lat: 22.5, lng: 89.0 },
  { lat: 21.6, lng: 88.2 }, { lat: 20.2, lng: 86.3 }, { lat: 17.7, lng: 83.3 },
  { lat: 16.0, lng: 81.2 }, { lat: 13.1, lng: 80.3 }, { lat: 10.2, lng: 79.8 },
  { lat: 9.3,  lng: 79.0 }, { lat: 8.08, lng: 77.55 }, { lat: 9.5,  lng: 76.3 },
  { lat: 11.8, lng: 75.3 }, { lat: 15.0, lng: 74.0 }, { lat: 19.0, lng: 72.8 },
  { lat: 20.8, lng: 72.7 }, { lat: 21.1, lng: 72.2 }, { lat: 20.7, lng: 70.9 },
  { lat: 21.8, lng: 69.1 }, { lat: 22.9, lng: 70.0 }, { lat: 23.7, lng: 68.2 },
  { lat: 24.8, lng: 70.3 }, { lat: 25.8, lng: 70.1 }, { lat: 27.5, lng: 70.5 },
  { lat: 29.5, lng: 72.8 }, { lat: 31.5, lng: 74.3 }, { lat: 32.8, lng: 74.8 },
  { lat: 34.5, lng: 74.0 }, { lat: 37.0, lng: 74.5 }
];

function isPointInPolygon(lat: number, lng: number, polygon: {lat: number, lng: number}[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const MONTHS = [
  "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", 
  "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", 
  "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026"
];

export default function IndiaMap3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [currentMonthIdx, setCurrentMonthIdx] = useState(6); // Default July (idx 6)
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotation, setRotation] = useState(0.5); // Z Orbit
  const [pitch, setPitch] = useState(0.75); // X Tilt
  const [autoRotate, setAutoRotate] = useState(true);
  
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // Generate glowing points inside India boundaries (Memoized for peak load times)
  const landmassDots = useMemo(() => {
    const dots: {lat: number, lng: number}[] = [];
    for (let lat = 8.2; lat <= 36.8; lat += 0.6) {
      for (let lng = 68.2; lng <= 97.2; lng += 0.6) {
        if (isPointInPolygon(lat, lng, DETAILED_INDIA_BORDER)) {
          dots.push({ lat, lng });
        }
      }
    }
    return dots;
  }, []);

  // Animation ticks
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentMonthIdx(prev => (prev + 1) % 12);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const tick = () => {
      setRotation(prev => (prev + 0.002) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - previousMouse.current.x;
    const dy = e.clientY - previousMouse.current.y;
    setRotation(prev => (prev - dx * 0.006) % (Math.PI * 2));
    setPitch(prev => Math.max(0.3, Math.min(Math.PI / 2.0, prev - dy * 0.006)));
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;

    // Projection method
    const project = (lat: number, lng: number, alt: number) => {
      const scale = 15.0;
      const x3d = (lng - 79.5) * scale;
      const y3d = -(lat - 22.5) * scale * 1.15;
      const z3d = alt;

      // Orbit Z rotation
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const x1 = x3d * cosR - y3d * sinR;
      const y1 = x3d * sinR + y3d * cosR;

      // Tilt X rotation
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z3d * sinP;
      const z2 = y1 * sinP + z3d * cosP;

      return { x: cx + x2, y: cy + y2, depth: z2 };
    };

    // 1. Draw glowing Point-Cloud matrix landmass
    landmassDots.forEach(p => {
      const pt = project(p.lat, p.lng, 0);
      
      // Paint circles representing the exact landmass surface
      ctx.fillStyle = 'rgba(129, 201, 132, 0.16)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Map and depth-sort 3D Agricultural State Pins
    const activeStates = INDIAN_STATES.map((st) => {
      const ndvi = st.monthlyNdvi[currentMonthIdx];
      const basePos = project(st.lat, st.lng, 0);
      
      // 3D column extrusion height
      const height = ndvi * 95;
      const topPos = project(st.lat, st.lng, height);
      return {
        ...st,
        ndvi,
        basePos,
        topPos,
        depth: basePos.depth
      };
    });

    // Sort states back-to-front depth
    activeStates.sort((a, b) => b.depth - a.depth);

    // Draw each state column pin & card
    activeStates.forEach(state => {
      const ndvi = state.ndvi;
      const bPos = state.basePos;
      const tPos = state.topPos;

      // Dynamic color: yellow (low index) to green (healthy index)
      const r = Math.floor(190 - ndvi * 140);
      const g = Math.floor(130 + ndvi * 110);
      const color = `rgb(${r}, ${g}, 45)`;

      // Pulsing radar base target
      const pulseRadius = (Date.now() / 40 % 24);
      ctx.save();
      ctx.translate(bPos.x, bPos.y);
      ctx.scale(1.0, 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(129, 201, 132, ${1 - (pulseRadius / 24)})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      // Draw 3D cylindrical stalk
      ctx.beginPath();
      ctx.moveTo(bPos.x - 3.5, bPos.y);
      ctx.lineTo(tPos.x - 3.5, tPos.y);
      ctx.lineTo(tPos.x + 3.5, tPos.y);
      ctx.lineTo(bPos.x + 3.5, bPos.y);
      ctx.closePath();
      
      const stalkGrad = ctx.createLinearGradient(bPos.x, bPos.y, tPos.x, tPos.y);
      stalkGrad.addColorStop(0, 'rgba(46, 125, 50, 0.15)');
      stalkGrad.addColorStop(1, color);
      ctx.fillStyle = stalkGrad;
      ctx.fill();

      // Top glowing indicator cap
      ctx.beginPath();
      ctx.arc(tPos.x, tPos.y, 6.0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Holographic text display boxes
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 4;
      
      // Floating data container
      ctx.fillStyle = 'rgba(10, 20, 15, 0.82)';
      ctx.fillRect(tPos.x + 10, tPos.y - 16, 95, 26);
      ctx.strokeStyle = 'rgba(129, 201, 132, 0.45)';
      ctx.strokeRect(tPos.x + 10, tPos.y - 16, 95, 26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(state.name, tPos.x + 14, tPos.y - 6);
      
      ctx.fillStyle = 'rgba(129, 201, 132, 0.9)';
      ctx.font = '7px sans-serif';
      ctx.fillText(`${state.crop}`, tPos.x + 14, tPos.y + 3);
      
      // NDVI mini value label
      ctx.fillStyle = '#81C784';
      ctx.font = 'bold 7px monospace';
      ctx.fillText(`NDVI: ${ndvi.toFixed(2)}`, tPos.x + 62, tPos.y - 6);
      
      ctx.restore();
    });

  }, [rotation, pitch, currentMonthIdx, landmassDots]);

  return (
    <div className="bg-text-main dark:bg-black w-full h-[520px] rounded-3xl overflow-hidden border border-white/5 relative flex flex-col group select-none">
      
      {/* 3D Render Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full flex-grow cursor-grab active:cursor-grabbing"
      />

      {/* Floating Info card (Top Left) */}
      <div className="absolute top-4 left-4 z-20 bg-black/85 border border-white/10 rounded-2xl p-4 max-w-xs shadow-lg space-y-2">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 animate-spin text-primary" />
          <span>India Crop NDVI Cloud</span>
        </h4>
        <p className="text-xs text-surface-container-highest/60 font-light leading-relaxed">
          Point-cloud matrix replica of the Indian landmass. Floating 3D telemetry stalks monitor real-time crop indexes across regional states.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white border-t border-white/10 pt-2 font-mono">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Timeline Horizon: {MONTHS[currentMonthIdx]}</span>
        </div>
      </div>

      {/* Orbit control icons (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center bg-black/85 border border-white/10 rounded-2xl p-2 space-x-2 shadow-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl transition-all ${isPlaying ? 'bg-primary text-white' : 'text-white hover:bg-white/10'}`}
          title="Play/Pause Monthly Animation"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl transition-all ${autoRotate ? 'bg-primary text-white' : 'text-white hover:bg-white/10'}`}
          title="Toggle Auto Orbit"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Month Slider Navigation (Bottom Center/Right) */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/85 border border-white/10 rounded-2xl p-3.5 w-72 shadow-lg space-y-2">
        <div className="flex justify-between text-[10px] text-surface-container-highest/60 font-mono font-bold">
          <span>2026 CALENDAR</span>
          <span className="text-primary">{MONTHS[currentMonthIdx].toUpperCase()}</span>
        </div>
        <input
          type="range"
          min="0"
          max="11"
          step="1"
          value={currentMonthIdx}
          onChange={(e) => {
            setCurrentMonthIdx(parseInt(e.target.value));
            setIsPlaying(false); // Stop loop when user manually controls slider
          }}
          className="w-full accent-primary bg-white/10 h-1.5 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[8px] text-surface-container-highest/40 font-mono">
          <span>JAN</span>
          <span>JUN</span>
          <span>DEC</span>
        </div>
      </div>

      {/* Floating Status Indicator (Top Right) */}
      <div className="absolute top-4 right-4 bg-black/85 text-background backdrop-blur-sm border border-white/10 px-3.5 py-1 rounded-full text-[9px] font-mono shadow-md tracking-wider flex items-center gap-1.5 text-primary">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
        <span>POINT CLOUD ACTIVE</span>
      </div>

    </div>
  );
}
