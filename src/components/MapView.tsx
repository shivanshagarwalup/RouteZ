'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Maximize, 
  Navigation, 
  Cloud, 
  Thermometer, 
  Wind, 
  Droplets, 
  Ruler, 
  Clock,
  Target,
  Map as MapIcon,
  Crosshair,
  Timer
} from 'lucide-react';
import { WeatherData } from '@/services/weatherService';

interface MapViewProps {
  sourceCoords?: [number, number];
  destCoords?: [number, number];
  routeCoords?: [number, number][];
  distance?: number; 
  duration?: number; 
  weather?: WeatherData;
  onFullscreen?: () => void;
  // Tracking Props
  trackingPosition?: [number, number] | null;
  isTracking?: boolean;
  progress?: number;
  eta?: string;
  trackingHistory?: { lat: number; lng: number }[];
}

export default function MapView({ 
  sourceCoords, 
  destCoords, 
  routeCoords, 
  distance, 
  duration, 
  weather,
  onFullscreen,
  trackingPosition,
  isTracking,
  progress,
  eta,
  trackingHistory
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const trackingLayerRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapRef.current) return;
    if (isInitializingRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        isInitializingRef.current = true;
        if (mapRef.current) {
           (mapRef.current as any)._leaflet_id = null;
           mapRef.current.innerHTML = ''; 
        }

        const L = (await import('leaflet')).default;
        if (mapInstanceRef.current || !mapRef.current) {
          isInitializingRef.current = false;
          return;
        }

        mapInstanceRef.current = L.map(mapRef.current!, {
          center: [39.5, -98.35],
          zoom: 4,
          zoomControl: false,
        });

        const dark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
          attribution: '© CartoDB © OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19
        });

        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        });

        if (mapType === 'streets') dark.addTo(mapInstanceRef.current);
        else satellite.addTo(mapInstanceRef.current);

        (mapInstanceRef.current as any)._tiles = { streets: dark, satellite };

        L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
        layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        trackingLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        
        setIsMapReady(true);
        isInitializingRef.current = false;
      } catch (err) {
        console.error('Map init error:', err);
        isInitializingRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
      isInitializingRef.current = false;
    };
  }, []);

  // Map Type Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;
    const tiles = (mapInstanceRef.current as any)._tiles;
    if (!tiles) return;

    if (mapType === 'streets') {
      mapInstanceRef.current.removeLayer(tiles.satellite);
      tiles.streets.addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.removeLayer(tiles.streets);
      tiles.satellite.addTo(mapInstanceRef.current);
    }
  }, [mapType, isMapReady]);

  // Update Route and Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const group = layerGroupRef.current;
      if (!group) return;
      
      group.clearLayers();

      if (sourceCoords) {
        L.circleMarker(sourceCoords, { 
          color: '#10b981', 
          fillColor: '#10b981', 
          fillOpacity: 1, 
          radius: 8,
          weight: 6,
          className: 'marker-pulse-green'
        }).addTo(group).bindPopup('<b>ORIGIN</b>');
      }

      if (destCoords) {
        L.circleMarker(destCoords, { 
          color: '#ef4444', 
          fillColor: '#ef4444', 
          fillOpacity: 1, 
          radius: 8, 
          weight: 6,
          className: 'marker-pulse-red'
        }).addTo(group).bindPopup('<b>DESTINATION</b>');
      }

      if (routeCoords && routeCoords.length > 0) {
        // GLOWING LAYER
        L.polyline(routeCoords, {
          color: '#3b82f6',
          weight: 8,
          opacity: 0.2,
          className: 'route-glow'
        }).addTo(group);

        const polyline = L.polyline(routeCoords, { 
          color: '#3b82f6', 
          weight: 3,
          opacity: 1,
          dashArray: '1, 10',
          className: 'route-line-animated'
        }).addTo(group);

        try {
          if (!isTracking) {
            mapInstanceRef.current.flyToBounds(polyline.getBounds(), { padding: [50, 50] });
          }
        } catch (e) {}
      }
    });
  }, [isMapReady, sourceCoords, destCoords, routeCoords, isTracking]);

  // Update Tracking Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !trackingLayerRef.current) return;

    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const group = trackingLayerRef.current;
      group.clearLayers();

      if (isTracking && trackingPosition) {
        // DRAW TRAIL
        if (trackingHistory && trackingHistory.length > 1) {
          const trailCoords = trackingHistory.map(p => [p.lat, p.lng] as [number, number]);
          L.polyline(trailCoords, {
            color: '#f43f5e',
            weight: 3,
            dashArray: '5, 5',
            opacity: 0.8
          }).addTo(group);
        }

        const truckMarker = L.marker(trackingPosition, {
          icon: L.divIcon({
            className: '',
            html: `<div style="font-size: 24px; animation: truck-pulse 1s infinite; filter: drop-shadow(0 0 8px rgba(59,130,246,0.8));">🚚</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }).addTo(group);

        truckMarker.bindTooltip(`<b>Shipment Vector</b><br/>Status: In Transit`, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip'
        });

        // AUTO CENTER ON SHIPMENT
        if (trackingPosition) {
          mapInstanceRef.current.panTo(trackingPosition, { animate: true });
        }
      }
    });
  }, [isTracking, trackingPosition, isMapReady]);

  const centerOn = useCallback((pos: [number, number] | undefined) => {
    if (pos && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(pos, 12);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/5 shadow-2xl group">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Progress Bar Overlay */}
      {isTracking && progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 z-20 px-8 py-6 pointer-events-none">
           <div className="max-w-2xl mx-auto bg-gray-950/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-3 px-2">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Live Tracking Active</span>
                 </div>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1.5"><Timer className="w-3 h-3" /> ETA: {eta}</span>
                    <span className="text-white">{progress}% Complete</span>
                 </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                   style={{ width: `${progress}%` }}
                 />
              </div>
           </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
         <button 
           onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
           className="p-3 bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl group/btn"
           title="Toggle Satellite View"
         >
            <MapIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
         </button>
         <button 
           onClick={() => centerOn(sourceCoords)}
           className="p-3 bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-xl group/btn"
           title="Center on Origin"
         >
            <Target className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
         </button>
         <button 
           onClick={() => centerOn(destCoords)}
           className="p-3 bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all shadow-xl group/btn"
           title="Center on Destination"
         >
            <Target className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
         </button>
         {isTracking && trackingPosition && (
           <button 
             onClick={() => centerOn(trackingPosition)}
             className="p-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 group/btn"
             title="Center on Shipment"
           >
              <Crosshair className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
           </button>
         )}
      </div>

      {/* Metrics Overlay (Old positions but upgraded) */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        {distance && duration && (
          <div className="bg-gray-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-8 pointer-events-auto">
              <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/10">
                    <Ruler className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Vector Length</p>
                    <p className="text-lg font-black text-white italic">{distance.toFixed(1)} <span className="text-[10px] uppercase ml-1">km</span></p>
                 </div>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
                    <Clock className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Time Horizon</p>
                    <p className="text-lg font-black text-white italic">{duration.toFixed(1)} <span className="text-[10px] uppercase ml-1">hrs</span></p>
                 </div>
              </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-950/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl pointer-events-auto">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-white uppercase tracking-widest">Atmospheric Uplink: Optimal</span>
        </div>
      </div>
      
      <style jsx global>{`
        .marker-pulse-orange {
          animation: pulse-orange 2s infinite;
        }
        @keyframes pulse-orange {
          0% { stroke-width: 8; stroke-opacity: 0.8; }
          50% { stroke-width: 16; stroke-opacity: 0.2; }
          100% { stroke-width: 8; stroke-opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
