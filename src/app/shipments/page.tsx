'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Plus,
  Loader2,
  Calendar,
  Truck,
  ShieldAlert,
  Navigation,
  Activity,
  MapPin,
  Maximize2,
  ChevronRight,
  Database,
  Zap,
  Globe
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AIMissionAssistant from '@/components/AIMissionAssistant';
import { useAuth } from '@/lib/authContext';
import { getUserShipments, deleteShipment, ShipmentData } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';

export default function ShipmentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) loadShipments();
  }, [user?.uid]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await getUserShipments(user!.uid);
      setShipments(data as ShipmentData[]);
    } catch (err) {
      toast.error('Failed to load logistics registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShipment(id);
      setShipments(shipments.filter(s => s.id !== id));
      toast.success('Vector purged from registry.');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Purge operation failed.');
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = 
        s.source.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, statusFilter]);

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden selection:bg-brand-primary/30">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-brand-darker/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                <Database className="w-6 h-6 text-brand-primary" />
             </div>
             <div>
                <h1 className="text-2xl font-black italic tracking-tighter">Tactical Registry</h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] leading-none mt-1">Operational Fleet Ledger</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end mr-4">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Fleet Capacity</p>
                <p className="text-sm font-black italic">{shipments.length} / 500 Vectors</p>
             </div>
             <Link 
               href="/dashboard"
               className="group relative flex items-center gap-3 px-8 py-3.5 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/80 transition-all overflow-hidden active:scale-95"
             >
               <Plus className="w-4 h-4" /> 
               <span className="relative z-10">Initiate Vector</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
             </Link>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-12">
            
            {/* FILTERS & SEARCH */}
            <div className="flex flex-col xl:flex-row gap-8 items-center justify-between">
              <div className="relative w-full xl:w-[450px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Locate operational vector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-dark border border-white/5 rounded-[24px] py-4.5 pl-14 pr-6 text-xs font-medium focus:outline-none focus:border-brand-primary/40 transition-all shadow-2xl"
                />
              </div>

              <div className="flex items-center gap-2 bg-brand-dark border border-white/5 p-2 rounded-[24px] shadow-2xl overflow-x-auto scrollbar-hide max-w-full">
                {['All', 'pending', 'in-transit', 'delivered', 'delayed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                      statusFilter === tab 
                        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID OF PREMIUM CARDS */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[480px] bg-brand-dark rounded-[48px] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 pb-20">
                <AnimatePresence>
                  {filteredShipments.map((s, idx) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-brand-dark border border-white/5 rounded-[48px] overflow-hidden card-hover group shadow-2xl flex flex-col relative"
                    >
                      {/* Mini Map Area (Phase D) */}
                      <div className="h-44 bg-brand-darker relative overflow-hidden shrink-0">
                         {/* Using a high-quality static map placeholder with RouteZ aesthetics */}
                         <img 
                           src={`https://staticmap.openstreetmap.de/staticmap.php?center=39.5,-98.35&zoom=3&size=600x300&maptype=dark`} 
                           className="w-full h-full object-cover opacity-20 grayscale contrast-[1.2] group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000"
                           alt="Route preview"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
                         
                         {/* Map HUD Overlays */}
                         <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                            <div className="px-4 py-1.5 bg-brand-darker/80 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                               {s.status}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                              s.riskLevel === 'High' ? 'bg-brand-danger/20 border-brand-danger/30 text-brand-danger' : 'bg-brand-success/20 border-brand-success/30 text-brand-success'
                            }`}>
                              {s.riskLevel} Risk
                            </div>
                         </div>

                         {/* Animated Route Line Mock */}
                         <div className="absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-30 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </div>

                      <div className="p-10 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Vector Hash</p>
                              <h4 className="text-xl font-black italic tracking-tighter">#SH-{s.id?.slice(-8).toUpperCase()}</h4>
                           </div>
                           <div className="p-3 bg-brand-darker border border-white/5 rounded-2xl group-hover:border-brand-primary/30 transition-colors">
                              <Truck className="w-6 h-6 text-gray-700 group-hover:text-brand-primary transition-colors" />
                           </div>
                        </div>

                        <div className="flex items-center gap-6 mb-10 relative">
                           <div className="flex-1">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Origin Node</p>
                              <p className="text-base font-black truncate italic">{s.source.split(',')[0]}</p>
                           </div>
                           <div className="shrink-0 flex flex-col items-center gap-1">
                              <div className="w-8 h-px bg-gray-800" />
                              <Zap className="w-4 h-4 text-brand-primary" />
                              <div className="w-8 h-px bg-gray-800" />
                           </div>
                           <div className="flex-1 text-right">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 text-right">Target Node</p>
                              <p className="text-base font-black truncate italic">{s.destination.split(',')[0]}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                           <div className="bg-brand-darker p-5 rounded-[24px] border border-white/5 shadow-inner">
                              <div className="flex items-center gap-3 mb-2">
                                 <Activity className="w-3.5 h-3.5 text-brand-primary" />
                                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Magnitude</p>
                              </div>
                              <p className="text-2xl font-black italic">{s.riskScore}%</p>
                           </div>
                           <div className="bg-brand-darker p-5 rounded-[24px] border border-white/5 shadow-inner">
                              <div className="flex items-center gap-3 mb-2">
                                 <Globe className="w-3.5 h-3.5 text-brand-accent" />
                                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Range</p>
                              </div>
                              <p className="text-2xl font-black italic">{(s.distance || 0).toFixed(0)} <span className="text-[10px] uppercase font-bold text-gray-600 ml-1">KM</span></p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 mt-auto">
                           <Link 
                             href={`/tracking`}
                             className="flex-1 py-4.5 bg-brand-primary text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/80 transition-all active:scale-95"
                           >
                             <Navigation className="w-4 h-4" /> Track Vector
                           </Link>
                           <button 
                             onClick={() => setDeleteConfirm(s.id!)}
                             className="p-4.5 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-[20px] hover:bg-brand-danger hover:text-white transition-all active:scale-95"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[80px] -z-10" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {!loading && filteredShipments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 bg-brand-dark/20 rounded-[64px] border border-dashed border-white/5">
                 <div className="w-24 h-24 rounded-[32px] bg-brand-dark flex items-center justify-center mb-8 border border-white/5">
                    <Activity className="w-12 h-12 text-gray-800" />
                 </div>
                 <h3 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">Registry Empty</h3>
                 <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.4em] italic">No operational data detected in local telemetry cluster.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-md bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-brand-dark border border-white/10 rounded-[48px] p-12 max-w-lg w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-danger/5 blur-[100px] -z-10" />
              <div className="w-24 h-24 bg-brand-danger/10 rounded-[32px] flex items-center justify-center mb-10 mx-auto border border-brand-danger/20 shadow-inner">
                 <ShieldAlert className="w-12 h-12 text-brand-danger" />
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter mb-6">Confirm Vector Purge</h3>
              <p className="text-gray-500 text-base font-medium mb-12 italic leading-relaxed">This operation will permanently erase the tactical vector from the encrypted cloud registry. This action cannot be reversed.</p>
              <div className="flex gap-6">
                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-5 bg-white/5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Abort Sync</button>
                 <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-5 bg-brand-danger text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-danger/30 active:scale-95 transition-all">Confirm Purge</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AIMissionAssistant />
    </div>
  );
}
