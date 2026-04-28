'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Truck, 
  ShieldAlert, 
  Globe, 
  Zap, 
  Clock, 
  MapPin, 
  Filter, 
  Activity,
  Navigation,
  ChevronRight,
  Maximize2,
  Crosshair,
  AlertTriangle,
  ArrowRight,
  Package,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AIMissionAssistant from '@/components/AIMissionAssistant';
import { useAuth } from '@/lib/authContext';
import { getUserShipments, getShipmentById, ShipmentData } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';
import Navbar from '@/components/Navbar';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function TrackingPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  
  // SHARED STATE
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // PUBLIC TRACKER STATE
  const [publicId, setPublicId] = useState('');
  const [publicShipment, setPublicShipment] = useState<ShipmentData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user?.uid) loadOperatorData();
    else setIsLoading(false);
  }, [user?.uid]);

  const loadOperatorData = async () => {
    setIsLoading(true);
    try {
      const data = await getUserShipments(user!.uid);
      setShipments(data as ShipmentData[]);
      if (data.length > 0) setSelectedId(data[0].id!);
    } catch (err) {
      toast.error('Failed to sync global fleet data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId.trim()) return;
    setIsSearching(true);
    try {
      const data = await getShipmentById(publicId);
      if (data) setPublicShipment(data as ShipmentData);
      else toast.error('Vector ID not recognized in global registry.');
    } catch (err) {
      toast.error('Registry sync failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectedShipment = useMemo(() => 
    shipments.find(s => s.id === selectedId), 
  [shipments, selectedId]);

  const filteredShipments = useMemo(() => 
    shipments.filter(s => 
      s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [shipments, searchQuery]);

  if (authLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity }} className="w-16 h-16 border-4 border-brand-primary/10 border-t-brand-primary rounded-3xl mb-6 shadow-2xl shadow-brand-primary/20" />
         <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.5em] italic text-center px-8">Synchronizing with Global Intelligence Cluster...</p>
      </div>
    );
  }

  // --- OPERATOR WAR ROOM VIEW ---
  if (user) {
    return (
      <div className="flex h-screen bg-brand-darker text-white overflow-hidden selection:bg-brand-primary/30">
        <Sidebar />
        <main className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 z-0">
             <MapView 
               sourceCoords={selectedShipment ? [39.5, -98.35] : undefined}
               destCoords={selectedShipment ? [40.5, -97.35] : undefined}
               isTracking={!!selectedId}
               progress={65}
               eta="2.4h"
             />
          </div>
          <div className="relative z-10 flex flex-col h-full pointer-events-none">
             <div className="p-8 flex justify-between items-start">
                <div className="flex flex-col gap-4 pointer-events-auto">
                   <div className="bg-brand-darker/90 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] shadow-2xl min-w-[300px]">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                            <Navigation className="w-5 h-5 text-brand-primary" />
                         </div>
                         <div>
                            <h1 className="text-lg font-black italic tracking-tighter">War Room</h1>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none mt-1">Live Fleet Command</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Active Vectors</p>
                            <p className="text-xl font-black italic">{shipments.length}</p>
                         </div>
                         <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Grid Health</p>
                            <p className="text-xl font-black italic text-brand-success uppercase">Optimal</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                   <div className="relative w-64 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Intercept ID..."
                        className="w-full bg-brand-darker/90 backdrop-blur-xl border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-2xl"
                      />
                   </div>
                </div>
             </div>
             <div className="flex-1 flex justify-between items-end p-8 overflow-hidden">
                <div className="w-80 space-y-4 pointer-events-auto overflow-hidden flex flex-col max-h-[60%]">
                   <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                      {filteredShipments.map((s, i) => (
                         <motion.div 
                           key={s.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                           onClick={() => setSelectedId(s.id!)}
                           className={`p-4 rounded-[28px] border transition-all cursor-pointer group ${
                             selectedId === s.id ? 'bg-brand-primary border-brand-primary shadow-2xl shadow-brand-primary/30' : 'bg-brand-darker/90 backdrop-blur-xl border-white/5 hover:bg-white/5'
                           }`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedId === s.id ? 'bg-white/20' : 'bg-brand-dark border-white/5'}`}>
                                  <Truck className={`w-5 h-5 ${selectedId === s.id ? 'text-white' : 'text-gray-500 group-hover:text-brand-primary transition-colors'}`} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${selectedId === s.id ? 'text-white/70' : 'text-gray-500'}`}>#SH-{s.id?.slice(-6).toUpperCase()}</p>
                                  <p className={`text-xs font-black truncate italic ${selectedId === s.id ? 'text-white' : 'text-gray-300'}`}>{s.destination.split(',')[0]}</p>
                               </div>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>
                <AnimatePresence mode="wait">
                  {selectedShipment && (
                    <motion.div key={selectedShipment.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-[450px] bg-brand-darker/90 backdrop-blur-xl border border-brand-primary/20 rounded-[48px] p-8 shadow-2xl pointer-events-auto">
                       <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">Vector Lock-on</p>
                       <h2 className="text-3xl font-black italic tracking-tighter mb-8">#SH-{selectedShipment.id?.slice(-10).toUpperCase()}</h2>
                       <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                             <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Velocity</p>
                             <p className="text-xl font-black italic">72.4 <span className="text-[10px]">KM/H</span></p>
                          </div>
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                             <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Health Index</p>
                             <p className="text-xl font-black italic text-brand-success">NOMINAL</p>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div>
                             <div className="flex justify-between items-center mb-2 px-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Route Progression</p>
                                <p className="text-[9px] font-black text-brand-primary tracking-widest">65.4%</p>
                             </div>
                             <div className="h-2 w-full bg-brand-dark border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] w-[65%]" />
                             </div>
                          </div>
                       </div>
                       <button className="w-full mt-10 py-5 bg-brand-primary rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/30 hover:bg-brand-primary/80 transition-all">
                          <Activity className="w-4 h-4" /> Strategic Vector Analysis
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <div className="bg-brand-darker/90 backdrop-blur-xl border-t border-white/5 p-4 flex items-center gap-8 pointer-events-auto overflow-hidden">
                <div className="flex items-center gap-3 px-6 border-r border-white/5 shrink-0">
                   <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">GLOBAL FEED</span>
                </div>
                <div className="flex-1 whitespace-nowrap overflow-hidden">
                   <motion.div animate={{ x: [1000, -2000] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="flex gap-20">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3 italic">
                           <AlertTriangle className="w-3.5 h-3.5 text-brand-warning" /> Shipment #SH-2024-00{i} detected moderate atmospheric disruption in Sector {i * 12}
                        </span>
                      ))}
                   </motion.div>
                </div>
             </div>
          </div>
          <AIMissionAssistant />
        </main>
      </div>
    );
  }

  // --- PUBLIC GUEST VIEW ---
  return (
    <div className="min-h-screen bg-brand-darker text-white selection:bg-brand-primary/30">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-32 pb-40">
        <div className="text-center mb-16">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary italic">Live Vector Registry Online</span>
           </motion.div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6">TRACK SHIPMENT</h1>
           <p className="text-gray-500 font-medium italic text-lg">Locate your strategic assets across the global network.</p>
        </div>

        <form onSubmit={handlePublicSearch} className="relative group max-w-2xl mx-auto mb-20">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
           <input 
             type="text" 
             value={publicId}
             onChange={(e) => setPublicId(e.target.value)}
             placeholder="ENTER VECTOR ID (e.g. SH-12345678)"
             className="w-full bg-brand-dark border border-white/5 rounded-[32px] py-6 pl-16 pr-40 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-brand-primary/40 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
           />
           <button 
             type="submit" 
             disabled={isSearching}
             className="absolute right-3 top-3 bottom-3 px-8 bg-brand-primary rounded-[22px] text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/80 transition-all disabled:opacity-50"
           >
             {isSearching ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Search System'}
           </button>
        </form>

        <AnimatePresence>
          {publicShipment && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-dark border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -z-10" />
               <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
                  <div>
                     <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-2">Asset Identified</p>
                     <h2 className="text-4xl font-black italic tracking-tighter mb-4">#SH-{publicShipment.id?.slice(-10).toUpperCase()}</h2>
                     <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-brand-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/10">In Transit</span>
                        <span className="text-gray-500 text-xs font-bold italic flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> ETA: 14:42</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Mission Path</p>
                     <p className="text-xl font-black italic leading-tight uppercase">{publicShipment.source.split(',')[0]} <ArrowRight className="inline w-4 h-4 mx-2 text-gray-700" /> {publicShipment.destination.split(',')[0]}</p>
                  </div>
               </div>

               {/* TIMELINE */}
               <div className="relative pt-8 pb-12">
                  <div className="absolute top-[4.5rem] left-0 right-0 h-[2px] bg-white/5 -z-10" />
                  <div className="absolute top-[4.5rem] left-0 w-[65%] h-[2px] bg-brand-primary shadow-[0_0_12px_rgba(59,130,246,0.5)] -z-10" />
                  
                  <div className="grid grid-cols-4 gap-4 relative z-10">
                     {[
                       { label: 'Ordered', icon: Package, status: 'complete' },
                       { label: 'Shipped', icon: Truck, status: 'complete' },
                       { label: 'In Transit', icon: Activity, status: 'active' },
                       { label: 'Delivered', icon: CheckCircle2, status: 'pending' }
                     ].map((step, i) => (
                       <div key={i} className="flex flex-col items-center">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 mb-6 transition-all ${
                            step.status === 'complete' ? 'bg-brand-primary border-brand-primary shadow-xl shadow-brand-primary/20 text-white' :
                            step.status === 'active' ? 'bg-brand-dark border-brand-primary shadow-2xl shadow-brand-primary/10 text-brand-primary animate-pulse' :
                            'bg-brand-dark border-white/5 text-gray-700'
                          }`}>
                             <step.icon className="w-6 h-6" />
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            step.status === 'pending' ? 'text-gray-600' : 'text-white'
                          }`}>{step.label}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="mt-8 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Risk Quotient</p>
                        <p className={`text-2xl font-black italic ${publicShipment.riskLevel === 'High' ? 'text-brand-danger' : 'text-brand-success'}`}>{publicShipment.riskScore}%</p>
                     </div>
                     <div className="w-px h-10 bg-white/5" />
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Operational Health</p>
                        <p className="text-2xl font-black italic text-brand-primary uppercase">Nominal</p>
                     </div>
                  </div>
                  <button className="flex items-center gap-3 text-brand-primary font-black uppercase tracking-widest text-[10px] hover:text-white transition-all group italic">
                     View Tactical Map <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!publicShipment && !isSearching && (
          <div className="text-center py-20 opacity-20 group">
             <Activity className="w-16 h-16 text-gray-500 mx-auto mb-8 group-hover:scale-110 transition-transform duration-500" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Awaiting Vector Input Command</p>
          </div>
        )}
      </main>
    </div>
  );
}
