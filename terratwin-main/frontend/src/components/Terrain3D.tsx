"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Farm } from '@/utils/mockData';
import { RotateCw, ZoomIn, ZoomOut, Play, Pause, RefreshCw, Layers } from 'lucide-react';

interface Terrain3DProps {
  farm: Farm;
  activeLayer: 'rgb' | 'ndvi' | 'ndwi' | 'moisture' | 'temperature' | 'yield';
  setActiveLayer: (layer: 'rgb' | 'ndvi' | 'ndwi' | 'moisture' | 'temperature' | 'yield') => void;
}

export default function Terrain3D({ farm, activeLayer, setActiveLayer }: Terrain3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Interactive 3D Orbit parameters
  const [zoom, setZoom] = useState(1.0);
  const [elevationScale, setElevationScale] = useState(1.5);
  const [rotation, setRotation] = useState(0.85); // Angle around Z-axis
  const [pitch, setPitch] = useState(0.65); // Angle around X-axis (tilt)
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Drag states
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Grid sizes
  const gridSize = 24;

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const tick = () => {
      setRotation(prev => (prev + 0.003) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Orbit drag events handler
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    
    setRotation(prev => (prev - deltaX * 0.007) % (Math.PI * 2));
    setPitch(prev => Math.max(0.2, Math.min(Math.PI / 2.1, prev - deltaY * 0.007)));
    
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Main 3D isometric projection loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution dynamically
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines/stars for sci-fi twin feel
    ctx.strokeStyle = 'rgba(129, 201, 132, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let j = 0; j < height; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
    }

    // Grid center point projection matrix mapping
    const cx = width / 2;
    const cy = height / 2 + 30;
    const spacing = 15 * zoom;

    // Helper to rotate and project a 3D coordinate [x, y, z] to 2D screen [sx, sy]
    const project = (x3d: number, y3d: number, z3d: number) => {
      // 1. Rotate around Z-axis (Rotation angle)
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const x1 = x3d * cosR - y3d * sinR;
      const y1 = x3d * sinR + y3d * cosR;

      // 2. Rotate around X-axis (Pitch / Tilt angle)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z3d * sinP;
      const z2 = y1 * sinP + z3d * cosP; // Depth

      // Perspective scale factor
      const screenX = cx + x2;
      const screenY = cy + y2;

      return { x: screenX, y: screenY, depth: z2 };
    };

    // Calculate height at index grid coordinates (Deterministic height values simulating Visakhapatnam hills)
    const getHeight = (i: number, j: number) => {
      const x = i - gridSize / 2;
      const y = j - gridSize / 2;
      // Rolling terrain overlay
      const h1 = Math.sin(i / 3.0) * Math.cos(j / 3.0) * 16;
      const h2 = Math.cos((i + j) / 5.0) * 8;
      // Border mask to slope down fields gracefully
      const borderFactor = Math.cos(((i / gridSize) - 0.5) * Math.PI) * Math.cos(((j / gridSize) - 0.5) * Math.PI);
      return (h1 + h2) * borderFactor * elevationScale;
    };

    // Color gradient maps
    const getColor = (i: number, j: number, heightVal: number) => {
      const factor = (i + j) / (gridSize * 2);
      const hash = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1;
      const normalizedHeight = (heightVal + 20) / 40; // 0 to 1 range approx

      switch (activeLayer) {
        case 'ndvi': {
          // Vegetation Index: Yellow (low) to Deep Green (high)
          const g = Math.floor(120 + normalizedHeight * 100 + hash * 20);
          const r = Math.floor(180 - normalizedHeight * 120);
          return `rgb(${Math.max(20, Math.min(255, r))}, ${Math.max(60, Math.min(255, g))}, 30)`;
        }
        case 'ndwi': {
          // Hydration Index: Light Blue to Deep Oceanic Blue
          const b = Math.floor(160 + normalizedHeight * 80 + hash * 15);
          const g = Math.floor(120 + normalizedHeight * 60);
          return `rgb(30, ${Math.max(60, Math.min(255, g))}, ${Math.max(120, Math.min(255, b))})`;
        }
        case 'moisture': {
          // Evapotranspiration stress: Cyan to Dark Brown/Orange
          const r = Math.floor(220 - normalizedHeight * 180 + hash * 15);
          const g = Math.floor(140 - normalizedHeight * 80);
          return `rgb(${Math.max(30, Math.min(255, r))}, ${Math.max(40, Math.min(255, g))}, 20)`;
        }
        case 'temperature': {
          // LST Heatmap: Cyan (cool) to Bright Crimson Red (hot)
          const r = Math.floor(100 + normalizedHeight * 155 + hash * 10);
          const b = Math.floor(255 - normalizedHeight * 200);
          return `rgb(${Math.max(20, Math.min(255, r))}, 50, ${Math.max(20, Math.min(255, b))})`;
        }
        case 'yield': {
          // Yield Potential: Orange/Yellow to Emerald Green
          const g = Math.floor(140 + normalizedHeight * 115);
          const r = Math.floor(240 - normalizedHeight * 180);
          return `rgb(${Math.max(40, Math.min(255, r))}, ${Math.max(100, Math.min(255, g))}, 35)`;
        }
        default: {
          // RGB True Color natural textures
          const g = Math.floor(100 + heightVal * 0.8 + hash * 15);
          const r = Math.floor(80 + heightVal * 0.5);
          return `rgb(${Math.max(40, Math.min(255, r))}, ${Math.max(60, Math.min(255, g))}, 40)`;
        }
      }
    };

    // Build grid point list and calculate projected positions
    const projectedGrid: any[][] = [];
    for (let i = 0; i <= gridSize; i++) {
      projectedGrid[i] = [];
      for (let j = 0; j <= gridSize; j++) {
        const x3d = (i - gridSize / 2) * spacing;
        const y3d = (j - gridSize / 2) * spacing;
        const z3d = getHeight(i, j);
        projectedGrid[i][j] = project(x3d, y3d, z3d);
      }
    }

    // Render cells in back-to-front depth ordering (Painters algorithm to resolve clipping overlaps)
    const cells: any[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Average depth of 4 corners
        const d = (
          projectedGrid[i][j].depth +
          projectedGrid[i+1][j].depth +
          projectedGrid[i+1][j+1].depth +
          projectedGrid[i][j+1].depth
        ) / 4;
        
        cells.push({ i, j, depth: d });
      }
    }

    // Sort cells: highest depth (furthest from viewport) first
    cells.sort((a, b) => b.depth - a.depth);

    // Draw the polygons
    cells.forEach(cell => {
      const { i, j } = cell;
      const p1 = projectedGrid[i][j];
      const p2 = projectedGrid[i+1][j];
      const p3 = projectedGrid[i+1][j+1];
      const p4 = projectedGrid[i][j+1];

      // Draw Quad
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();

      const hAvg = (getHeight(i, j) + getHeight(i+1, j+1)) / 2;
      ctx.fillStyle = getColor(i, j, hAvg);
      ctx.fill();

      // Mesh Grid wireframe lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw compass indicator (North direction vector overlay)
    const northVec = project(0, -gridSize / 2 * spacing - 40, 0);
    const centerVec = project(0, 0, 0);
    ctx.beginPath();
    ctx.moveTo(cx, 40);
    ctx.lineTo(cx, 25);
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#D32F2F';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('N', cx - 3, 20);

  }, [zoom, elevationScale, rotation, pitch, activeLayer, farm]);

  return (
    <div className="w-full h-[520px] bg-text-main dark:bg-black relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group select-none">
      
      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full flex-grow cursor-grab active:cursor-grabbing"
        title="Left Click & Drag to Orbit Terrain"
      />

      {/* Control Card overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 space-y-1 max-w-xs shadow-lg">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary px-2 mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>3D HEATMAPS</span>
        </h4>
        {[
          { key: 'rgb', label: 'True Color RGB' },
          { key: 'ndvi', label: '3D NDVI Greenness' },
          { key: 'ndwi', label: '3D NDWI Water' },
          { key: 'moisture', label: '3D Soil Moisture' },
          { key: 'temperature', label: '3D Land Temp (LST)' },
          { key: 'yield', label: '3D Yield Potential' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveLayer(item.key as any)}
            className={`px-3 py-1.5 text-left rounded-xl text-[10px] font-bold transition-all ${activeLayer === item.key ? 'bg-primary text-white shadow-sm' : 'text-surface-container-highest/60 hover:text-white hover:bg-white/5'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Orbit Toolbar Control Cards (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-2 space-x-2 shadow-lg">
        <button
          onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
          className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
          className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-white/20"></div>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl transition-all ${autoRotate ? 'bg-primary text-white' : 'text-white hover:bg-white/10'}`}
          title="Toggle Auto Flyover Rotation"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setElevationScale(1.5);
            setRotation(0.85);
            setPitch(0.65);
            setAutoRotate(true);
          }}
          className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Reset Orbit Camera"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Orbit sliders (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 space-y-2 text-[10px] text-white shadow-lg w-48">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between font-mono font-bold text-surface-container-highest/60">
            <span>ZOOM</span>
            <span>{zoom.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-primary bg-white/10 h-1 rounded-full cursor-pointer"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between font-mono font-bold text-surface-container-highest/60">
            <span>ELEVATION SCALE</span>
            <span>{elevationScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={elevationScale}
            onChange={(e) => setElevationScale(parseFloat(e.target.value))}
            className="w-full accent-primary bg-white/10 h-1 rounded-full cursor-pointer"
          />
        </div>
      </div>

      {/* Watermark grid overlay indicator */}
      <div className="absolute top-4 right-4 bg-black/85 text-background backdrop-blur-sm border border-white/10 px-3.5 py-1 rounded-full text-[9px] font-mono shadow-md tracking-wider flex items-center gap-1.5 text-primary">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
        <span>{farm.name.toUpperCase()} DIGITAL TWIN</span>
      </div>
    </div>
  );
}
