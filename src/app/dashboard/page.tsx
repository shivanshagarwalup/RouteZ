'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Search, 
  Bell, 
  Calendar,
  Truck,
  ShieldAlert,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreVertical,
  Activity,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ShipmentForm from '@/components/ShipmentForm';
import RiskPanel from '@/components/RiskPanel';
import AIMissionAssistant from '@/components/AIMissionAssistant';
import { useAuth } from '@/lib/authContext';
import { getUserShipments, ShipmentData, saveShipment } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';
import { geocodeCity } from '@/services/geocodingService';
import { getRealRoute } from '@/services/mapService';
import { predictRisk } from '@/workflows/riskPrediction';
import { optimizeRoute } from '@/workflows/optimization';
import confetti from 'canvas-confetti';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  // CORE STATE
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [shipmentType, setShipmentType] = useState('Standard');
  const [isLoading, setIsLoading] = useState(false);
  const [recentShipments, setRecentShipments] = useState<ShipmentData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // GEOSPATIAL STATE
  const [sourceCoords, setSourceCoords] = useState<[number, number] | undefined>(undefined);
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>(undefined);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | undefined>(undefined);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // ANALYSIS STATE
  const [riskData, setRiskData] = useState<any>(undefined);
  const [optimizationData, setOptimizationData] = useState<any>(undefined);

  // TRACKING STATE
  const [canTrack, setCanTrack] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [trackingEta, setTrackingEta] = useState('');
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);

  // INITIAL LOAD
  const loadRecentShipments = useCallback(async () => {
    if (!user) return;
    try {
      const shipments = await getUserShipments(user.uid);
      setRecentShipments(shipments as ShipmentData[]);
    } catch {
      console.log('Could not load recent shipments');
    }
  }, [user]);

  useEffect(() => {
    if (user) loadRecentShipments();
  }, [user, loadRecentShipments]);

  // KPI STATS
  const stats = useMemo(() => {
    const total = recentShipments.length;
    const onTime = total > 0 ? 94.2 : 0; 
    const highRisk = recentShipments.filter(s => s.riskLevel === 'High').length;
    const totalDist = recentShipments.reduce((acc, s) => acc + (s.distance || 0), 0);
    return [
      { label: 'Active Shipments', value: total, icon: Truck, color: 'text-brand-primary', bg: 'bg-brand-primary/10', trend: 12, up: true },
      { label: 'On-Time Rate', value: `${onTime}%`, icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10', trend: 2.1, up: true },
      { label: 'High Risk Nodes', value: highRisk, icon: AlertTriangle, color: 'text-brand-danger', bg: 'bg-brand-danger/10', trend: 4.2, up: false },
      { label: 'Network Range', value: `${(totalDist / 1000).toFixed(1)}k`, icon: Globe, color: 'text-brand-accent', bg: 'bg-brand-accent/10', trend: 8.5, up: true },
    ];
  }, [recentShipments]);

  const handleAnalyze = async (srcInput: string, dstInput: string, typeInput: string) => {
    setSource(srcInput);
    setDestination(dstInput);
    setShipmentType(typeInput);
    setIsLoading(true);
    setCanTrack(false);
    setIsTracking(false);
    
    try {
      const [srcC, dstC] = await Promise.all([geocodeCity(srcInput), geocodeCity(dstInput)]);
      setSourceCoords(srcC);
      setDestCoords(dstC);

      const routeData = await getRealRoute(srcC, dstC).catch(() => ({ 
        coordinates: [srcC, dstC] as [number, number][], 
        distance: 500, 
        duration: 8 
      }));
      setRouteCoords(routeData.coordinates);
      setDistance(routeData.distance);
      setDuration(routeData.duration);

      const riskResult = await predictRisk(srcInput, dstInput, 'Clear', routeData.distance, typeInput);
      setRiskData(riskResult);
      if (riskResult.risk_level === 'Low') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

      const optResult = await optimizeRoute(srcInput, dstInput, riskResult);
      setOptimizationData(optResult);

      if (user) {
        await saveShipment(user.uid, {
          source: srcInput,
          destination: dstInput,
          shipmentType: typeInput,
          status: 'pending',
          riskLevel: riskResult.risk_level,
          riskScore: riskResult.risk_score,
          riskFactors: riskResult.factors || [],
          recommendation: riskResult.recommendation || '',
          estimatedDelay: riskResult.estimated_delay || '',
          optimizationData: optResult || {},
          distance: routeData.distance
        });
        loadRecentShipments();
        toast.success('Strategy codified in cloud registry.');
      }
      setCanTrack(true);
    } catch (error) {
      toast.error('Vector analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = () => {
    if (!routeCoords) return;
    setIsTracking(true);
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx >= routeCoords.length - 1) {
        clearInterval(interval);
        setIsTracking(false);
        return;
      }
      currentIdx++;
      setCurrentPosition(routeCoords[currentIdx]);
      setTrackingProgress(Math.round((currentIdx / routeCoords.length) * 100));
      setTrackingEta(`${Math.floor((routeCoords.length - currentIdx) * 2 / 60)}h`);
    }, 500);
    (window as any).trackingInterval = interval;
  };

  const stopTracking = () => {
    if ((window as any).trackingInterval) {
      clearInterval((window as any).trackingInterval);
      setIsTracking(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const filteredShipments = useMemo(() => {
    return recentShipments.filter(s => 
      s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [recentShipments, searchQuery]);

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden selection:bg-brand-primary/30">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-brand-darker/50 backdrop-blur-xl z-50">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tactical vectors..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:border-brand-primary/40 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
              <p className="text-sm font-black text-white italic">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <button className="relative p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-danger rounded-full border-2 border-brand-darker" />
            </button>
            <div className="group relative">
               <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center cursor-pointer overflow-hidden">
                  {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon className="w-5 h-5 text-brand-primary" />}
               </div>
               <div className="absolute right-0 top-full mt-2 w-48 bg-brand-dark border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200] p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-xs font-black uppercase text-brand-danger transition-colors">
                     <LogOut className="w-4 h-4" /> Sign Out System
                  </button>
               </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-brand-dark border border-white/5 p-8 rounded-[40px] card-hover flex flex-col gap-6 shadow-2xl relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${stat.up ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                      {stat.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {stat.trend}%
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 leading-none">{stat.label}</p>
                    <h3 className="text-4xl font-black italic tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>

            {/* LIVE FLEET MAP */}
            <div className="bg-brand-dark border border-white/5 rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-brand-darker/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Live Fleet Vector</span>
                </div>
                
                <AnimatePresence>
                  {canTrack && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                       {!isTracking ? (
                         <button onClick={startTracking} className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/80 transition-all flex items-center gap-2">
                            <Play className="w-4 h-4 fill-white" /> Start Mission
                         </button>
                       ) : (
                         <button onClick={stopTracking} className="bg-brand-danger text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-danger/20 hover:bg-brand-danger/80 transition-all flex items-center gap-2">
                            <Square className="w-4 h-4 fill-white" /> Abort Tracking
                         </button>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="h-[580px]">
                <MapView 
                  sourceCoords={sourceCoords} 
                  destCoords={destCoords} 
                  routeCoords={routeCoords}
                  distance={distance}
                  duration={duration}
                  isTracking={isTracking}
                  trackingPosition={currentPosition}
                  progress={trackingProgress}
                  eta={trackingEta}
                />
              </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
              
              {/* SHIPMENT LIST */}
              <div className="lg:col-span-7 bg-brand-dark border border-white/5 rounded-[48px] p-10 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-4">
                    <Activity className="w-7 h-7 text-brand-primary" /> Tactical Operations Ledger
                  </h3>
                  <button onClick={() => router.push('/shipments')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">View All Nodes</button>
                </div>
                <div className="space-y-5 flex-1">
                  {filteredShipments.map((s) => (
                    <motion.div 
                      key={s.id} 
                      layout
                      className="group p-5 bg-brand-darker border border-white/5 rounded-[32px] hover:bg-white/5 transition-all flex items-center justify-between cursor-pointer"
                      onClick={() => router.push(`/shipments/${s.id}`)}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-14 h-14 rounded-2xl bg-brand-dark flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:border-brand-primary/30 transition-all duration-500 shadow-inner">
                          <Truck className="w-7 h-7 text-gray-600 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[11px] font-black text-gray-500 font-mono tracking-tighter">#SH-{s.id?.slice(-8).toUpperCase()}</span>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              s.status === 'delivered' ? 'bg-brand-success/10 text-brand-success' : 
                              s.status === 'delayed' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-primary/10 text-brand-primary'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <p className="text-base font-black italic">{s.source.split(',')[0]} <ArrowRight className="inline w-4 h-4 mx-2 text-gray-700" /> {s.destination.split(',')[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Risk Index</p>
                          <p className={`text-lg font-black italic ${s.riskLevel === 'High' ? 'text-brand-danger' : s.riskLevel === 'Medium' ? 'text-brand-warning' : 'text-brand-success'}`}>{s.riskScore}%</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {recentShipments.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-6">
                       <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5">
                          <Activity className="w-10 h-10 text-gray-800" />
                       </div>
                       <p className="text-sm text-gray-500 font-black uppercase tracking-[0.3em] italic max-w-xs">No operational data detected in local telemetry cluster.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI INSIGHTS */}
              <div className="lg:col-span-5 space-y-10">
                <RiskPanel 
                   riskData={riskData ? {
                     risk_level: riskData.risk_level,
                     risk_score: riskData.risk_score,
                     factors: riskData.factors,
                     recommendation: riskData.recommendation,
                     estimated_delay: riskData.estimated_delay
                   } : undefined} 
                   optimizationData={optimizationData} 
                   isLoading={isLoading} 
                   onSave={() => toast.info('Intelligence already stored in registry.')} 
                   isLoggedIn={!!user} 
                />
                
                <div className="bg-brand-primary p-10 rounded-[48px] shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full -z-10 group-hover:scale-150 transition-transform duration-1000" />
                   <h3 className="text-2xl font-black italic text-white mb-8 flex items-center gap-4">
                      <Zap className="w-7 h-7 fill-white animate-pulse" /> Initiate Strategic Vector
                   </h3>
                   <ShipmentForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <AIMissionAssistant />
    </div>
  );
}
