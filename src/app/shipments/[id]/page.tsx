'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  ShieldAlert,
  Zap,
  CheckCircle,
  Truck,
  Box,
  Loader2,
  Maximize2,
  X,
  CloudLightning,
  MapPin,
  Clock,
  Navigation,
  Timer,
  Activity
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RiskPanel from '@/components/RiskPanel';
import MapView from '@/components/MapView';
import WeatherCard from '@/components/WeatherCard';
import { getShipment, updateShipmentStatus, ShipmentData } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';
import { getRealRoute } from '@/services/mapService';
import { getWeather, WeatherData } from '@/services/weatherService';
import { geocodeCity } from '@/services/geocodingService';

const US_CENTER_COORDS: [number, number] = [39.5, -98.35];

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [srcWeather, setSrcWeather] = useState<WeatherData | undefined>(undefined);
  const [dstWeather, setDstWeather] = useState<WeatherData | undefined>(undefined);

  const [sourceCoords, setSourceCoords] = useState<[number, number] | undefined>(undefined);
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>(undefined);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | undefined>(undefined);
  const [displayDistance, setDisplayDistance] = useState<number | undefined>(undefined);
  const [displayDuration, setDisplayDuration] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (id) loadShipment();
  }, [id]);

  const loadShipment = async () => {
    setLoading(true);
    try {
      const data = await getShipment(id as string);
      if (data) {
        setShipment(data as ShipmentData);
        initMapAndWeather(data as ShipmentData);
      } else {
        toast.error('Shipment metadata lost.');
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error('Failed to load mission details.');
    } finally {
      setLoading(false);
    }
  };

  const initMapAndWeather = async (s: ShipmentData) => {
    try {
      let sCoords = US_CENTER_COORDS;
      let dCoords = US_CENTER_COORDS;
      try {
        const [resSrc, resDst] = await Promise.all([geocodeCity(s.source), geocodeCity(s.destination)]);
        sCoords = resSrc;
        dCoords = resDst;
      } catch (e) {}
      
      setSourceCoords(sCoords);
      setDestCoords(dCoords);
      
      const routeData = await getRealRoute(sCoords, dCoords).catch(() => ({ coordinates: [sCoords, dCoords], distance: 500, duration: 8 }));
      setRouteCoords(routeData.coordinates);
      setDisplayDistance(routeData.distance);
      setDisplayDuration(routeData.duration);

      const [wS, wD] = await Promise.all([
        getWeather(s.source).catch(() => undefined),
        getWeather(s.destination).catch(() => undefined)
      ]);
      setSrcWeather(wS);
      setDstWeather(wD);
    } catch (err) {}
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateShipmentStatus(id as string, newStatus);
      setShipment(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Tactical phase updated: ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update phase.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <p className="text-gray-500 font-black tracking-widest text-xs uppercase italic">Syncing Operations Registry...</p>
      </div>
    );
  }

  if (!shipment) return null;

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-brand-darker/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
               <span>Tactical View</span>
               <ChevronRight className="w-4 h-4 text-brand-primary" />
               <span className="text-white">ID: {typeof id === 'string' ? id.slice(-8).toUpperCase() : 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
             <span className="text-[8px] font-black uppercase text-gray-500 px-4 tracking-[0.2em] italic">Operational Phase:</span>
             <select 
               value={shipment.status}
               disabled={updating}
               onChange={(e) => handleStatusUpdate(e.target.value)}
               className="bg-brand-dark border border-white/10 text-[10px] font-black rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary transition-all text-brand-primary uppercase"
             >
               {['pending', 'in-transit', 'delivered', 'delayed'].map(opt => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-brand-dark rounded-[40px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-inner">
                       <Truck className="w-8 h-8 text-brand-primary" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black italic tracking-tighter">{shipment.source} → {shipment.destination}</h2>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                             <Box className="w-3 h-3" /> {shipment.shipmentType}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/5" />
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5">
                             <Zap className="w-3 h-3" /> Mission Priority: High
                          </span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="h-[500px] relative rounded-[32px] overflow-hidden border border-white/5 bg-brand-darker">
                    <MapView 
                      sourceCoords={sourceCoords}
                      destCoords={destCoords}
                      routeCoords={routeCoords}
                      distance={displayDistance}
                      duration={displayDuration}
                      weather={srcWeather}
                      onFullscreen={() => setIsFullscreen(true)}
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="bg-brand-darker p-5 rounded-3xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Vector Range</p>
                       <p className="text-xl font-black">{displayDistance || '---'} <span className="text-xs text-gray-500 ml-1">KM</span></p>
                    </div>
                    <div className="bg-brand-darker p-5 rounded-3xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Time To Target</p>
                       <p className="text-xl font-black">{displayDuration || '---'} <span className="text-xs text-gray-500 ml-1">HRS</span></p>
                    </div>
                    <div className="bg-brand-darker p-5 rounded-3xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Risk Magnitude</p>
                       <p className="text-xl font-black text-brand-danger">{shipment.riskScore}%</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {srcWeather && <WeatherCard weather={srcWeather} label="Origin Hub" />}
                 {dstWeather && <WeatherCard weather={dstWeather} label="Target Hub" />}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">
               <RiskPanel 
                 riskData={{
                   risk_level: shipment.riskLevel as any,
                   risk_score: shipment.riskScore,
                   factors: shipment.riskFactors,
                   recommendation: shipment.recommendation,
                   estimated_delay: shipment.estimatedDelay,
                   confidence: 99
                 }} 
                 isLoading={false} 
                 optimizationData={shipment.optimizationData}
               />

               <div className="bg-brand-dark border border-white/5 rounded-[40px] p-8 space-y-8">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Activity className="w-5 h-5 text-brand-primary" /> Tactical Registry
                  </h3>
                  
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs font-black uppercase">Operation Hash</span>
                        <span className="text-xs font-black text-brand-primary font-mono italic">#SSC-{id?.slice(-12).toUpperCase()}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs font-black uppercase">Log Timestamp</span>
                        <span className="text-xs font-black text-gray-300">
                          {shipment.createdAt?.toDate ? shipment.createdAt.toDate().toLocaleString() : 'N/A'}
                        </span>
                     </div>
                     
                     <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Navigation className="w-3 h-3" /> Event Timeline
                        </p>
                        <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                           <div className="relative">
                              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-brand-primary border-4 border-brand-dark shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                              <p className="text-xs font-black text-white italic uppercase mb-1">Phase: {shipment.status}</p>
                              <p className="text-[10px] text-gray-500 font-bold italic">LPU verified state change recorded.</p>
                           </div>
                           <div className="relative">
                              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white/10 border-4 border-brand-dark" />
                              <p className="text-xs font-black text-gray-400 italic uppercase mb-1">Vector Initialized</p>
                              <p className="text-[10px] text-gray-500 font-bold italic">Strategic route geometry encoded.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-brand-darker flex flex-col">
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-brand-darker/80 backdrop-blur-xl">
               <div className="flex items-center gap-6">
                  <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                     <Maximize2 className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black italic tracking-tighter">Strategic Network View</h2>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{shipment.source} → {shipment.destination}</p>
                  </div>
               </div>
               <button onClick={() => setIsFullscreen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                 <X className="w-7 h-7 text-gray-500" />
               </button>
            </div>
            <div className="flex-1 relative">
               <MapView 
                 sourceCoords={sourceCoords}
                 destCoords={destCoords}
                 routeCoords={routeCoords}
                 distance={displayDistance}
                 duration={displayDuration}
                 weather={srcWeather}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
