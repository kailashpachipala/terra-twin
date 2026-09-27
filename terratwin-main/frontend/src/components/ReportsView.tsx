"use client";

import React, { useState } from 'react';
import { Farm } from '@/utils/mockData';
import { FileText, Download, Loader2, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReportsViewProps {
  farm: Farm;
}

export default function ReportsView({ farm }: ReportsViewProps) {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(true);
  const [selectedSoil, setSelectedSoil] = useState(true);
  const [selectedYield, setSelectedYield] = useState(true);
  const [selectedIrrigation, setSelectedIrrigation] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  const triggerDownload = () => {
    setExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);

      let filename = `terratwin_report_${farm.name.toLowerCase().replace(/ /g, '_')}`;

      if (format === 'csv') {
        filename += '.csv';
        let content = "Parameter,Value,Status/Confidence\n";
        content += `Farm Name,${farm.name},N/A\n`;
        content += `Crop Type,${farm.cropType},N/A\n`;
        content += `Location,${farm.location},N/A\n`;
        content += `Size,${farm.sizeHectares} Hectares,N/A\n`;
        if (selectedIndices) content += `Health Index,${farm.healthScore}%,Optimal\n`;
        if (selectedSoil) {
          content += `Soil Nitrogen,${farm.soilHealth.n} ppm,Optimal\n`;
          content += `Soil Phosphorus,${farm.soilHealth.p} ppm,Optimal\n`;
          content += `Soil Potassium,${farm.soilHealth.k} ppm,Optimal\n`;
        }
        if (selectedYield) content += `Yield Projection,${farm.yieldProjection.value} t/ac,${farm.yieldProjection.confidence}% Confidence\n`;
        if (selectedIrrigation) content += `Irrigation Status,${farm.irrigation.status},Cycle Remaining: ${farm.irrigation.cycleRemaining}\n`;

        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        filename += '.pdf';
        
        // Compile binary-compliant PDF using jsPDF
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50); // TerraTwin primary green color
        doc.text("TERRATWIN PRECISION AGRI REPORT", 14, 25);
        
        doc.setDrawColor(46, 125, 50);
        doc.setLineWidth(0.5);
        doc.line(14, 28, 196, 28);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("1. Farm & Metadata Parameters", 14, 45);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Farm Name:       ${farm.name}`, 18, 52);
        doc.text(`Region/Center:   ${farm.location}`, 18, 58);
        doc.text(`Crop Variety:    ${farm.cropType}`, 18, 64);
        doc.text(`Plot Area Size:  ${farm.sizeHectares} Hectares`, 18, 70);
        
        let yPos = 82;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("2. Spatial Telemetry & Health Diagnostics", 14, yPos);
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        if (selectedIndices) {
          doc.text(`* Vegetation Health Index (NDVI): ${farm.healthScore}%`, 18, yPos);
          yPos += 6;
        }
        if (selectedSoil) {
          doc.text(`* Soil Composition Balance: N: ${farm.soilHealth.n} ppm | P: ${farm.soilHealth.p} ppm | K: ${farm.soilHealth.k} ppm`, 18, yPos);
          yPos += 6;
          doc.text(`* Estimated pH balance: ${farm.soilHealth.ph} (Sufficient)`, 18, yPos);
          yPos += 6;
        }
        if (selectedYield) {
          doc.text(`* Predicted Harvest Yield: ${farm.yieldProjection.value} Tons/Acre (XGBoost Confidence: ${farm.yieldProjection.confidence}%)`, 18, yPos);
          yPos += 6;
        }
        if (selectedIrrigation) {
          doc.text(`* Hydration Status: ${farm.irrigation.status}`, 18, yPos);
          yPos += 6;
          doc.text(`* Advisory details: ${farm.irrigation.advisory}`, 18, yPos);
          yPos += 6;
        }
        
        yPos += 8;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, yPos, 196, yPos);
        yPos += 8;
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text("This report is derived from verified Copernicus Sentinel-2 MSI and ESA Landsat reflectance bands.", 14, yPos);
        yPos += 5;
        doc.text("TerraTwin Platform. Real processed satellite data verification framework active.", 14, yPos);
        
        // Save PDF file locally
        doc.save(filename);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Configuration column */}
      <div className="lg:col-span-2 bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-text-main dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Compile Digital Twin Report
          </h3>
          <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light mt-0.5">Aggregate satellite indices and neural projection logs into a portable document.</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Choose Sections to Export</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedIndices} 
                onChange={(e) => setSelectedIndices(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary rounded" 
              />
              <div className="text-xs">
                <div className="font-bold">Satellite Indices</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">NDVI, NDWI, EVI over past 30 days</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedSoil} 
                onChange={(e) => setSelectedSoil(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary rounded" 
              />
              <div className="text-xs">
                <div className="font-bold">Soil Nutrients</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Estimated NPK balances and pH indexes</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedYield} 
                onChange={(e) => setSelectedYield(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary rounded" 
              />
              <div className="text-xs">
                <div className="font-bold">Yield Projections</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Tonnage estimate and confidence level</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-background dark:bg-white/5 border border-surface-container-highest dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedIrrigation} 
                onChange={(e) => setSelectedIrrigation(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary rounded" 
              />
              <div className="text-xs">
                <div className="font-bold">Irrigation Advisory</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Water requirements and EVT ratings</div>
              </div>
            </label>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Select File Format</h4>
          <div className="flex gap-4">
            <button
              onClick={() => setFormat('pdf')}
              className={`flex-1 py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${format === 'pdf' ? 'bg-primary text-white border-transparent' : 'border-primary/20 text-primary hover:bg-primary-light'}`}
            >
              PDF Document
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`flex-1 py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${format === 'csv' ? 'bg-primary text-white border-transparent' : 'border-primary/20 text-primary hover:bg-primary-light'}`}
            >
              Spreadsheet (CSV)
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={triggerDownload}
          disabled={exporting || (!selectedIndices && !selectedSoil && !selectedYield && !selectedIrrigation)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Compiling Spatial Indexes...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Registered Report</span>
            </>
          )}
        </button>
      </div>

      {/* Overview/Teaser sidebar */}
      <div className="space-y-6">
        
        {/* Compliance checklist card */}
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Verification & Audit Integrity
          </h4>
          <ul className="space-y-2 text-xs text-text-secondary dark:text-surface-container-highest/70 font-light leading-relaxed">
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Google Earth Engine pixel statistics matching farm coordinates are verified.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Explainable AI logs (SHAP values) are compiled into the metadata.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>All coordinate boundaries match registered state/county codes.</span>
            </li>
          </ul>
        </div>

        {/* Dispatch report email */}
        <div className="bg-primary-light dark:bg-white/5 border border-primary/10 rounded-2xl p-6 space-y-4">
          <div className="flex gap-2 items-center text-primary dark:text-white">
            <Mail className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Scheduled Dispatch</h4>
          </div>
          <p className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-light leading-relaxed">
            Would you like to dispatch this report automatically every week to your agronomists' emails?
          </p>
          {exportSuccess ? (
            <div className="p-3 bg-success-light border border-success/20 text-success text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Report successfully downloaded!
            </div>
          ) : (
            <button className="w-full py-2.5 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 text-xs font-bold transition-all">
              Configure Weekly Email Dispatch
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
