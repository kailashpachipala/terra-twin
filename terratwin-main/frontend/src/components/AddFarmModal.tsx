"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Upload, MapPin, Layers, Locate, Compass, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AddFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModeType = 'draw' | 'coords' | 'geojson' | 'kml' | 'shapefile' | 'gps';

export default function AddFarmModal({ isOpen, onClose }: AddFarmModalProps) {
  const { addFarm, apiConnected } = useApp();
  const [mode, setMode] = useState<ModeType>('coords');
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Visakhapatnam, Andhra Pradesh, India');
  const [cropType, setCropType] = useState('Wine Grapes');
  const [sizeHectares, setSizeHectares] = useState('1.6');
  
  // Coordinates Mode states
  const [latitude, setLatitude] = useState('17.7816');
  const [longitude, setLongitude] = useState('83.3768');
  
  // File uploads
  const [fileError, setFileError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [parsedMsg, setParsedMsg] = useState('');

  if (!isOpen) return null;

  const handleGPSRetrieve = () => {
    setFileError('');
    setParsedMsg('');
    if (!navigator.geolocation) {
      setFileError("GPS is not supported by your browser workstation.");
      return;
    }
    
    setUploadLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setParsedMsg(`✓ Successfully fetched current GPS sensor coordinates.`);
        setUploadLoading(false);
      },
      (error) => {
        setFileError(`GPS access denied: ${error.message}`);
        setUploadLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'geojson' | 'kml' | 'shapefile') => {
    setFileError('');
    setParsedMsg('');
    setPolygonCoords([]);
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle Zipped Shapefile upload to FastAPI backend
    if (fileType === 'shapefile') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'zip') {
        setFileError('Shapefiles must be uploaded inside a compressed .zip archive.');
        return;
      }

      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem('token');
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        };
        const url = apiConnected ? 'http://localhost:8000/api/farms/upload-shapefile' : null;
        
        if (!url) {
          // Mock parser if offline
          setTimeout(() => {
            setLatitude("38.5025");
            setLongitude("-122.4722");
            setPolygonCoords([
              [38.5060, -122.4760],
              [38.5060, -122.4680],
              [38.4980, -122.4680],
              [38.4980, -122.4760],
              [38.5060, -122.4760]
            ]);
            setParsedMsg(`✓ Offline simulated parse of Shapefile ZIP: ${file.name}`);
            setUploadLoading(false);
          }, 1000);
          return;
        }

        const res = await axios.post(url, formData, { headers });
        if (res.data && res.data.polygon) {
          setPolygonCoords(res.data.polygon);
          setLatitude(res.data.coordinates[0].toFixed(6));
          setLongitude(res.data.coordinates[1].toFixed(6));
          setParsedMsg(`✓ Successfully parsed Shapefile geometry: ${res.data.polygon.length} points.`);
        }
      } catch (err: any) {
        setFileError(err.response?.data?.detail || 'Failed to verify Shapefile zip archive on backend.');
      } finally {
        setUploadLoading(false);
      }
      return;
    }

    // Client-side GeoJSON & KML parse stubs
    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (fileType === 'geojson') {
          const parsed = JSON.parse(text);
          const feature = parsed.type === 'FeatureCollection' ? parsed.features[0] : parsed;
          if (feature.geometry?.type === 'Polygon') {
            const coords = feature.geometry.coordinates[0];
            const leafletCoords: [number, number][] = coords.map((c: any) => [c[1], c[0]] as [number, number]);
            setPolygonCoords(leafletCoords);
            
            // Get center
            const lats = leafletCoords.map((c: any) => c[0]);
            const lngs = leafletCoords.map((c: any) => c[1]);
            setLatitude((lats.reduce((a: number, b: number) => a + b, 0) / lats.length).toFixed(6));
            setLongitude((lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length).toFixed(6));
            setParsedMsg(`✓ Successfully parsed GeoJSON: ${leafletCoords.length} points.`);
          } else {
            setFileError("Geometry is not of type 'Polygon'.");
          }
        } else if (fileType === 'kml') {
          // Extract coordinates block from KML XML
          const match = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
          if (match && match[1]) {
            const coordsStr = match[1].trim();
            const coordPairs = coordsStr.split(/\s+/);
            const leafletCoords: [number, number][] = coordPairs.map(pair => {
              const parts = pair.split(',');
              return [parseFloat(parts[1]), parseFloat(parts[0])] as [number, number]; // Map [lng, lat] to [lat, lng]
            }).filter(c => !isNaN(c[0]) && !isNaN(c[1])) as [number, number][];

            setPolygonCoords(leafletCoords);
            
            const lats = leafletCoords.map(c => c[0]);
            const lngs = leafletCoords.map(c => c[1]);
            setLatitude((lats.reduce((a, b) => a + b, 0) / lats.length).toFixed(6));
            setLongitude((lngs.reduce((a, b) => a + b, 0) / lngs.length).toFixed(6));
            setParsedMsg(`✓ Successfully parsed KML coordinates: ${leafletCoords.length} points.`);
          } else {
            setFileError("No coordinates tags located in KML XML structure.");
          }
        }
      } catch (err) {
        setFileError('Failed to parse vector file.');
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    let finalPolygon = polygonCoords;

    // If coordinates were entered manually and no polygon was uploaded, generate standard boundary box
    if (finalPolygon.length === 0) {
      const offset = 0.004;
      finalPolygon = [
        [lat + offset, lng - offset],
        [lat + offset, lng + offset],
        [lat - offset, lng + offset],
        [lat - offset, lng - offset],
        [lat + offset, lng - offset]
      ];
    }

    addFarm({
      name: name || "Primary Cultivation Plot",
      location,
      cropType,
      sizeHectares: parseFloat(sizeHectares),
      coordinates: [lat, lng],
      polygon: finalPolygon
    });

    onClose();
    // Reset state
    setName('');
    setPolygonCoords([]);
    setParsedMsg('');
    setFileError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-text-main rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-surface-container-highest dark:border-white/10 relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-container-highest dark:border-white/10 flex justify-between items-center bg-primary-light dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-text-main dark:text-white">Register Digital Farm Twin</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest dark:hover:bg-white/10 text-text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Select Tabs */}
        <div className="bg-background dark:bg-white/5 px-6 py-3 border-b border-surface-container-highest dark:border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setMode('coords')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'coords' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            LatLng Coordinates
          </button>
          <button
            type="button"
            onClick={() => setMode('gps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${mode === 'gps' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            <Locate className="w-3 h-3" /> GPS Location
          </button>
          <button
            type="button"
            onClick={() => setMode('geojson')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'geojson' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            GeoJSON
          </button>
          <button
            type="button"
            onClick={() => setMode('kml')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'kml' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            KML
          </button>
          <button
            type="button"
            onClick={() => setMode('shapefile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'shapefile' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            Shapefile (.ZIP)
          </button>
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${mode === 'draw' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-container-high'}`}
          >
            <Compass className="w-3 h-3" /> Draw Boundary
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Dynamic input depending on selected mode */}
          {mode === 'coords' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="manual-lat" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                  Latitude coordinates
                </label>
                <input
                  id="manual-lat"
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="manual-lng" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                  Longitude coordinates
                </label>
                <input
                  id="manual-lng"
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {mode === 'gps' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                GPS Geolocator
              </label>
              <button
                type="button"
                onClick={handleGPSRetrieve}
                disabled={uploadLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 dark:bg-white/5 border border-primary/20 text-primary dark:text-white font-bold py-3.5 rounded-xl text-sm transition-all"
              >
                {uploadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Locate className="w-5 h-5" />}
                Retrieve GPS Coordinates
              </button>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  readOnly
                  value={latitude}
                  className="px-4 py-2.5 rounded-xl bg-surface-container dark:bg-white/10 text-text-secondary text-sm border-none cursor-not-allowed"
                  placeholder="Latitude"
                />
                <input
                  type="text"
                  readOnly
                  value={longitude}
                  className="px-4 py-2.5 rounded-xl bg-surface-container dark:bg-white/10 text-text-secondary text-sm border-none cursor-not-allowed"
                  placeholder="Longitude"
                />
              </div>
            </div>
          )}

          {(mode === 'geojson' || mode === 'kml' || mode === 'shapefile') && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Upload Vector Polygon File
              </label>
              <div className="border-2 border-dashed border-primary/20 hover:border-primary/50 dark:border-white/10 dark:hover:border-white/30 rounded-xl p-4 transition-all relative flex flex-col items-center justify-center bg-background dark:bg-white/5 cursor-pointer">
                <input
                  type="file"
                  accept={mode === 'geojson' ? '.geojson,.json' : mode === 'kml' ? '.kml' : '.zip'}
                  onChange={(e) => handleFileUpload(e, mode)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-primary mb-2" />
                <div className="text-xs text-text-main dark:text-white font-semibold">
                  {mode === 'geojson' ? 'Upload GeoJSON Polygon file' : mode === 'kml' ? 'Upload KML XML file' : 'Upload Shapefile ZIP file (.shp, .dbf, .shx)'}
                </div>
              </div>
            </div>
          )}

          {mode === 'draw' && (
            <div className="p-4 bg-primary-light/50 dark:bg-white/5 rounded-xl border border-primary/10 text-xs leading-relaxed space-y-2">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1">
                <Compass className="w-4 h-4" />
                How to draw boundary
              </h4>
              <p className="text-text-secondary dark:text-surface-container-highest/60 font-light">
                Close this window, select the <b>Draw Polygon</b> tool in the upper-left of the Digital Twin map, click on the map corners of your farm to place vertices, and double-click to finalize. Your farm's perimeter and area will be synced automatically.
              </p>
            </div>
          )}

          {uploadLoading && (
            <div className="text-xs text-text-secondary font-mono flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Analyzing vector geometry...</span>
            </div>
          )}

          {fileError && <div className="text-xs text-error font-semibold">{fileError}</div>}
          {parsedMsg && <div className="text-xs text-success font-semibold">{parsedMsg}</div>}

          <div className="h-[1px] bg-surface-container-highest dark:border-white/10 my-2"></div>

          {/* Core Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="plot-name" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Farm / Plot Name
              </label>
              <input
                id="plot-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. West Coast Citrus Plot 12"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="crop-type-select" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Crop Varietal
              </label>
              <select
                id="crop-type-select"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="Wheat">Wheat</option>
                <option value="Corn">Corn</option>
                <option value="Almonds">Almonds</option>
                <option value="Wine Grapes">Wine Grapes</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Citrus">Citrus</option>
              </select>
            </div>

            <div>
              <label htmlFor="size-select" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Size (Hectares)
              </label>
              <input
                id="size-select"
                type="number"
                required
                value={sizeHectares}
                onChange={(e) => setSizeHectares(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container-highest dark:border-white/10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary-light transition-all text-sm animate-pulse-slow"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mode === 'draw' || uploadLoading}
              className="w-1/2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all text-sm shadow-md disabled:opacity-50"
            >
              Onboard Farm Twin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
