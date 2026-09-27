"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Farm } from '@/utils/mockData';
import { Layers, HelpCircle, Locate, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import axios from 'axios';

// Fix Leaflet icon assets mapping issue in React packages
const setupLeafletMarker = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Sub-component to center the map when selected farm coordinates change
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14, { animate: true, duration: 0.8 });
  }, [coords, map]);
  return null;
}

interface FarmMapProps {
  farm: Farm;
  activeLayer: 'rgb' | 'ndvi' | 'ndwi' | 'moisture';
  setActiveLayer: (layer: 'rgb' | 'ndvi' | 'ndwi' | 'moisture') => void;
}

export default function FarmMap({ farm, activeLayer, setActiveLayer }: FarmMapProps) {
  const { apiConnected } = useApp();
  const [isClient, setIsClient] = useState(false);
  const [geeTileUrl, setGeeTileUrl] = useState<string | null>(null);
  const [tileLoading, setTileLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setupLeafletMarker();
  }, []);

  // Fetch GEE Tile Overlays from API if active
  useEffect(() => {
    if (!isClient) return;

    if (apiConnected && activeLayer !== 'rgb') {
      setTileLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8000/api/satellite/tiles/${farm.id}/${activeLayer}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data && res.data.tile_url) {
          setGeeTileUrl(res.data.tile_url);
        } else {
          setGeeTileUrl(null);
        }
      })
      .catch(() => {
        setGeeTileUrl(null);
      })
      .finally(() => {
        setTileLoading(false);
      });
    } else {
      setGeeTileUrl(null);
      setTileLoading(false);
    }
  }, [farm.id, activeLayer, apiConnected, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-surface-container-high dark:bg-white/5 flex items-center justify-center flex-col gap-3 rounded-2xl animate-pulse">
        <Layers className="w-8 h-8 text-primary/40 animate-spin" />
        <span className="text-xs text-text-secondary dark:text-surface-container-highest/60 font-semibold font-mono">Initializing GIS Engine...</span>
      </div>
    );
  }

  // Fallback vector polygon styles depending on active index
  const getPolygonStyle = () => {
    // If GEE raster tile overlay is successfully rendered, make the boundary transparent
    if (geeTileUrl) {
      return {
        fillColor: 'transparent',
        fillOpacity: 0.0,
        color: '#FFFFFF',
        weight: 3,
        dashArray: '2, 5'
      };
    }

    switch (activeLayer) {
      case 'ndvi':
        return {
          fillColor: farm.healthScore > 85 ? '#2E7D32' : '#FBC02D',
          fillOpacity: 0.55,
          color: '#1B5E20',
          weight: 2,
        };
      case 'ndwi':
        return {
          fillColor: '#1976D2',
          fillOpacity: 0.55,
          color: '#0D47A1',
          weight: 2,
        };
      case 'moisture':
        return {
          fillColor: farm.moistureStress > 30 ? '#D32F2F' : '#009688',
          fillOpacity: 0.55,
          color: farm.moistureStress > 30 ? '#B71C1C' : '#004D40',
          weight: 2,
        };
      default:
        return {
          fillColor: '#81C784',
          fillOpacity: 0.25,
          color: '#2E7D32',
          weight: 2,
          dashArray: '4, 4'
        };
    }
  };

  const getLegendLabels = () => {
    switch (activeLayer) {
      case 'ndvi':
        return { title: 'NDVI Vegetation Index', gradient: 'from-[#FBC02D] to-[#2E7D32]', min: 'Low (0.0)', max: 'High (1.0)' };
      case 'ndwi':
        return { title: 'NDWI Canopy Water', gradient: 'from-[#BBDEFB] to-[#0D47A1]', min: 'Dry (0.0)', max: 'Saturated (1.0)' };
      case 'moisture':
        return { title: 'Soil Moisture Stress', gradient: 'from-[#009688] to-[#D32F2F]', min: 'Optimal', max: 'Critical Stress' };
      default:
        return null;
    }
  };

  const legend = getLegendLabels();

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-surface-container-highest dark:border-white/10 shadow-inner">
      <MapContainer
        center={farm.coordinates}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        {/* Professional High Resolution ESRI World Imagery Base Map */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Real GEE satellite layers overlay */}
        {geeTileUrl && (
          <TileLayer
            key={geeTileUrl}
            url={geeTileUrl}
            opacity={0.8}
            attribution="Google Earth Engine"
          />
        )}

        {/* Dynamic Zooming */}
        <ChangeMapView coords={farm.coordinates} />

        {/* Boundary Polygon */}
        {farm.polygon && farm.polygon.length > 0 && (
          <Polygon
            positions={farm.polygon}
            pathOptions={getPolygonStyle()}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-extrabold text-sm text-primary">{farm.name}</h4>
                <p className="text-xs text-text-secondary mt-0.5">Crop: <b>{farm.cropType}</b></p>
                <p className="text-xs text-text-secondary">Area: <b>{farm.sizeHectares} Hectares</b></p>
                <div className="mt-2 text-xs font-mono bg-primary-light dark:bg-white/10 p-1.5 rounded uppercase font-bold text-center text-primary">
                  {activeLayer.toUpperCase()} Active
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Pulse Marker center Pin */}
        <Marker position={farm.coordinates}>
          <Popup>
            <div className="text-xs font-semibold">
              Sensor Node Location<br/>
              Lat: {farm.coordinates[0]}<br/>
              Lng: {farm.coordinates[1]}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Layer selector floating cards */}
      <div className="absolute top-4 left-4 z-20 flex flex-col bg-white/95 dark:bg-text-main/95 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-surface-container-highest dark:border-white/10 space-y-1">
        <button
          onClick={() => setActiveLayer('rgb')}
          className={`p-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'rgb' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background dark:hover:bg-white/5'}`}
          title="RGB Camera view"
        >
          <Layers className="w-4 h-4" />
          <span>True Color RGB</span>
        </button>
        <button
          onClick={() => setActiveLayer('ndvi')}
          className={`p-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'ndvi' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background dark:hover:bg-white/5'}`}
          title="Normalized Difference Vegetation Index"
        >
          <Layers className="w-4 h-4" />
          <span>NDVI Greenness</span>
        </button>
        <button
          onClick={() => setActiveLayer('ndwi')}
          className={`p-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'ndwi' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background dark:hover:bg-white/5'}`}
          title="Normalized Difference Water Index"
        >
          <Layers className="w-4 h-4" />
          <span>NDWI Hydration</span>
        </button>
        <button
          onClick={() => setActiveLayer('moisture')}
          className={`p-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'moisture' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background dark:hover:bg-white/5'}`}
          title="Soil Evapotranspiration stress levels"
        >
          <Layers className="w-4 h-4" />
          <span>Soil Moisture</span>
        </button>
      </div>

      {/* Legend overlay */}
      {legend && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-text-main/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-surface-container-highest dark:border-white/10 max-w-xs w-52">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-text-secondary dark:text-surface-container-highest/60 mb-2 flex items-center gap-1">
            {legend.title}
            <HelpCircle className="w-3 h-3 cursor-help text-text-secondary" />
          </h4>
          <div className={`w-full h-3 bg-gradient-to-r ${legend.gradient} rounded-full mb-1`}></div>
          <div className="flex justify-between text-[9px] text-text-secondary dark:text-surface-container-highest/40 font-bold uppercase">
            <span>{legend.min}</span>
            <span>{legend.max}</span>
          </div>
        </div>
      )}

      {/* Loading overlay for GEE Tiles */}
      {tileLoading && (
        <div className="absolute top-4 right-4 z-20 bg-text-main/80 text-background px-3 py-1.5 rounded-xl text-[10px] font-mono shadow-md border border-white/10 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Compiling GEE overlays...</span>
        </div>
      )}

      {/* Lat/Lng indicator bottom right */}
      <div className="absolute bottom-4 right-4 z-20 bg-text-main/80 text-background px-3 py-1.5 rounded-xl text-[10px] font-mono shadow-md border border-white/10 pointer-events-none select-none">
        CTR: {farm.coordinates[0].toFixed(5)}, {farm.coordinates[1].toFixed(5)}
      </div>
    </div>
  );
}
