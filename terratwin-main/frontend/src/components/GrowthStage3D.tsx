"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Timer, Target, Sparkles } from 'lucide-react';

interface GrowthStage3DProps {
  currentStage: string;
}

const STAGES = [
  { key: 'Seed', label: '1. Seed', desc: 'Sown seed state resting inside subterranean moisture layer.' },
  { key: 'Germination', label: '2. Germination', desc: 'Radicle and cotyledon emergence breaching soil boundary.' },
  { key: 'Vegetative', label: '3. Vegetative', desc: 'Stolon development, primary leaf expansion, and node branching.' },
  { key: 'Flowering', label: '4. Flowering', desc: 'Corolla blooming, attracting local pollinators for fertilization.' },
  { key: 'Fruiting', label: '5. Fruiting', desc: 'Ovary swelling, fruit set expansion, and sugar concentration.' },
  { key: 'Maturity', label: '6. Maturity', desc: 'Max biomass potential, optimal physiological ripeness reached.' },
  { key: 'Harvest', label: '7. Harvest', desc: 'Safe crop extraction completed, ready for mandi distribution.' }
];

export default function GrowthStage3D({ currentStage }: GrowthStage3DProps) {
  const [selectedStage, setSelectedStage] = useState('Vegetative');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);

  // Default to farm's growth stage if matching
  useEffect(() => {
    const matched = STAGES.find(s => s.key.toLowerCase() === currentStage.toLowerCase() || currentStage.toLowerCase().includes(s.key.toLowerCase()));
    if (matched) {
      setSelectedStage(matched.key);
    }
  }, [currentStage]);

  // Rotational animation loop
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setAngle(prev => (prev + 0.015) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Render the procedural plant based on selected stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Setup coordinates: center of soil base
    const bx = w / 2;
    const by = h - 60;

    // Draw grid platform base (Sci-fi 3D grid disk)
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(1.0, 0.45); // Compress Y to simulate 3D perspective tilt
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(129, 201, 132, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw grid radial spokes inside platform
    ctx.strokeStyle = 'rgba(129, 201, 132, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const spAngle = angle + (i * Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(spAngle) * 75, Math.sin(spAngle) * 75);
      ctx.stroke();
    }
    ctx.restore();

    // Draw soil pot base (3D cylinder segment)
    ctx.fillStyle = 'rgba(110, 75, 50, 0.9)';
    ctx.beginPath();
    ctx.ellipse(bx, by, 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Helper to draw procedural leaves
    const drawLeaf = (lx: number, ly: number, lAngle: number, scale: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lAngle);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-10, -15, 0, -35); // Left curve
      ctx.quadraticCurveTo(10, -15, 0, 0);   // Right curve
      ctx.fillStyle = 'rgba(76, 175, 80, 0.95)';
      ctx.fill();

      // Leaf middle vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -32);
      ctx.stroke();
      ctx.restore();
    };

    // Helper to draw blossom flowers
    const drawFlower = (fx: number, fy: number, size: number) => {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle * 1.5);
      ctx.fillStyle = '#FFE119'; // Yellow bloom petals
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -size / 1.5, size / 2.5, size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(Math.PI * 2 / 5);
      }
      // Center bud
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#E65100';
      ctx.fill();
      ctx.restore();
    };

    // Helper to draw fruit hanging grapes/berries
    const drawFruit = (fx: number, fy: number, size: number) => {
      ctx.save();
      ctx.translate(fx, fy);
      // Small grape bunch
      ctx.fillStyle = '#9C27B0'; // Purple grapes
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.arc(-size * 0.7, size * 0.8, size, 0, Math.PI * 2);
      ctx.arc(size * 0.7, size * 0.8, size, 0, Math.PI * 2);
      ctx.arc(0, size * 1.5, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Procedural branching vectors depending on stage selection
    ctx.strokeStyle = 'rgba(93, 64, 55, 0.95)'; // Woody stem color
    ctx.lineCap = 'round';

    switch (selectedStage) {
      case 'Seed':
        // Subterranean seed dot
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.arc(bx, by + 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
        break;

      case 'Germination':
        // Tiny emerging seedling loop
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 10, by - 15, bx - 8, by - 25);
        ctx.stroke();

        // Baby cotyledon leaves
        drawLeaf(bx - 8, by - 25, -Math.PI / 4, 0.45);
        drawLeaf(bx - 8, by - 25, Math.PI / 4, 0.4);
        break;

      case 'Vegetative':
        // Main stem
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 15, by - 40, bx, by - 80);
        ctx.stroke();

        // Branches
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx - 8, by - 45);
        ctx.lineTo(bx - 32, by - 65);
        ctx.moveTo(bx + 5, by - 60);
        ctx.lineTo(bx + 28, by - 78);
        ctx.stroke();

        // Leaves
        drawLeaf(bx, by - 80, 0, 0.8);
        drawLeaf(bx - 32, by - 65, -Math.PI / 3, 0.75);
        drawLeaf(bx + 28, by - 78, Math.PI / 3, 0.7);
        drawLeaf(bx - 8, by - 45, -Math.PI / 4, 0.6);
        break;

      case 'Flowering':
        // Main stem
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + 10, by - 50, bx - 5, by - 105);
        ctx.stroke();

        // Branches
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(bx + 5, by - 55);
        ctx.lineTo(bx - 28, by - 82);
        ctx.moveTo(bx - 2, by - 75);
        ctx.lineTo(bx + 30, by - 102);
        ctx.stroke();

        // Leaves
        drawLeaf(bx - 28, by - 82, -Math.PI / 3, 0.7);
        drawLeaf(bx + 30, by - 102, Math.PI / 3, 0.65);
        drawLeaf(bx - 5, by - 105, 0, 0.6);

        // Flowers
        drawFlower(bx - 5, by - 110, 11);
        drawFlower(bx - 28, by - 88, 9);
        drawFlower(bx + 30, by - 108, 9);
        break;

      case 'Fruiting':
        // Main stem
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 5, by - 55, bx + 2, by - 110);
        ctx.stroke();

        // Lateral branches
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by - 60);
        ctx.lineTo(bx - 35, by - 90);
        ctx.moveTo(bx + 1, by - 85);
        ctx.lineTo(bx + 35, by - 112);
        ctx.stroke();

        // Leaves
        drawLeaf(bx - 35, by - 90, -Math.PI / 3, 0.7);
        drawLeaf(bx + 35, by - 112, Math.PI / 3, 0.65);

        // Hanging Fruits (grapes/berries)
        drawFruit(bx - 3, by - 60, 6);
        drawFruit(bx - 35, by - 90, 5);
        drawFruit(bx + 35, by - 112, 5);
        break;

      case 'Maturity':
        // Thick main stem
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + 5, by - 60, bx - 2, by - 120);
        ctx.stroke();

        // Multiple thick branches
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(bx + 2, by - 55);
        ctx.lineTo(bx - 38, by - 85);
        ctx.moveTo(bx - 1, by - 80);
        ctx.lineTo(bx + 38, by - 110);
        ctx.stroke();

        // Plentiful foliage
        drawLeaf(bx - 2, by - 120, 0, 0.85);
        drawLeaf(bx - 38, by - 85, -Math.PI / 3, 0.8);
        drawLeaf(bx + 38, by - 110, Math.PI / 3, 0.75);
        drawLeaf(bx - 18, by - 95, -Math.PI / 4, 0.7);
        drawLeaf(bx + 18, by - 100, Math.PI / 4, 0.7);

        // Ripe purple hanging fruit bunches
        drawFruit(bx - 38, by - 80, 7);
        drawFruit(bx + 38, by - 105, 7);
        drawFruit(bx, by - 65, 7);
        break;

      case 'Harvest':
        // Clipped stem stub on pot
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - 12);
        ctx.stroke();

        // Harvested basket of ripe crop products
        ctx.fillStyle = '#8D6E63'; // Basket
        ctx.beginPath();
        ctx.ellipse(bx + 35, by + 5, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Grapes inside basket
        drawFruit(bx + 28, by + 2, 4);
        drawFruit(bx + 42, by + 2, 4);
        drawFruit(bx + 35, by - 2, 4.5);
        break;
    }

  }, [selectedStage, angle]);

  return (
    <div className="bg-white dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-2xl overflow-hidden p-5 flex flex-col md:flex-row gap-6 shadow-sm">
      
      {/* 3D Render viewport */}
      <div className="w-full md:w-1/2 h-64 bg-text-main dark:bg-black/60 rounded-xl relative overflow-hidden border border-white/5 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-primary border border-white/5">
          <Sparkles className="w-3 h-3 animate-spin" />
          <span>PROCEDURAL RENDER ACTIVE</span>
        </div>
      </div>

      {/* Advisory selector cards */}
      <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-text-secondary dark:text-surface-container-highest/60 flex items-center gap-1">
            <Sprout className="w-4 h-4 text-primary" />
            <span>Interactive Crop Growth Stages</span>
          </h3>
          <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light leading-relaxed">
            Procedurally rendered crop twin representation showing active canopy models.
          </p>
        </div>

        {/* Tab row */}
        <div className="grid grid-cols-4 gap-1.5">
          {STAGES.map(stage => (
            <button
              key={stage.key}
              onClick={() => setSelectedStage(stage.key)}
              className={`py-1 text-center rounded text-[9px] font-bold transition-all border ${selectedStage === stage.key ? 'bg-primary text-white border-primary shadow-sm' : 'text-text-secondary dark:text-surface-container-highest/60 border-surface-container-highest dark:border-white/5 hover:bg-background dark:hover:bg-white/5'}`}
            >
              {stage.key}
            </button>
          ))}
        </div>

        {/* Advisory stats */}
        <div className="p-3.5 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl space-y-2 font-mono text-[10px] text-text-secondary dark:text-surface-container-highest/60 leading-normal">
          <div className="font-sans text-[11px] font-extrabold text-text-main dark:text-white flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span>{selectedStage.toUpperCase()} SUMMARY</span>
          </div>
          <p className="font-sans leading-normal">{STAGES.find(s => s.key === selectedStage)?.desc}</p>
          <div className="flex justify-between border-t border-surface-container-highest dark:border-white/5 pt-2 mt-2 font-bold text-primary">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Growth period</span>
            <span>{selectedStage === 'Harvest' ? 'Completed' : 'Active Cycle'}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
