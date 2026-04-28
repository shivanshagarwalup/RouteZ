'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Database,
  ArrowRight,
  ChevronRight,
  Zap,
  Activity,
  Scan
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import { getUserAlerts, markAlertRead, markAllAlertsRead, deleteAlert, Alert } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';

export default function AlertsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.uid) loadAlerts();
  }, [user?.uid]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await getUserAlerts(user!.uid);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllAlertsRead(user.uid);
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      toast.success('All tactical alerts marked as read.');
    } catch (err) {
      toast.error('Failed to sync status.');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.info('Incident report purged.');
    } catch (err) {
      toast.error('Failed to delete report.');
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'unread' ? !a.isRead : a.severity === filter);
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destination?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [alerts, filter, searchQuery]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center">
         <motion.div 
           animate={{ rotate: 360 }} 
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="w-12 h-12 border-4 border-brand-primary/10 border-t-brand-primary rounded-full mb-4"
         />
         <p className="text-gray-500 font-black text-xs uppercase tracking-widest italic">Syncing Threat Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden selection:bg-brand-primary/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-danger/10 rounded-2xl border border-brand-danger/20">
                    <Bell className="w-8 h-8 text-brand-danger" />
                 </div>
                 <div>
                    <h1 className="text-4xl font-black italic tracking-tighter">Tactical Alerts</h1>
                    <p className="text-[10px] font-black text-brand-danger uppercase tracking-[0.4em] leading-none mt-1">Operational Threat Monitor</p>
                 </div>
                 {unreadCount > 0 && (
                   <span className="px-3 py-1 bg-brand-danger rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse ml-4 shadow-xl shadow-brand-danger/20">
                      {unreadCount} New Risks
                   </span>
                 )}
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                 onClick={handleMarkAllRead}
                 className="px-6 py-3.5 bg-brand-dark border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
               >
                 Mark All Resolved
               </button>
               <button 
                 onClick={loadAlerts}
                 className="p-3.5 bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/80 transition-all active:scale-95"
               >
                 <Clock className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* MANAGEMENT BAR */}
          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operational logs..."
                  className="w-full bg-brand-dark border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-brand-primary/50 transition-all shadow-2xl"
                />
             </div>
             
             <div className="flex bg-brand-dark p-1.5 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto scrollbar-hide">
                {(['all', 'unread', 'critical', 'warning', 'info'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f 
                      ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>

          {/* ALERTS LIST */}
          <div className="space-y-6">
             {filteredAlerts.length === 0 ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center py-32 bg-brand-dark/20 rounded-[48px] border border-dashed border-white/5"
               >
                  <div className="w-24 h-24 rounded-[32px] bg-brand-dark flex items-center justify-center mb-8 border border-white/5">
                     <Scan className="w-10 h-10 text-gray-800" />
                  </div>
                  <h3 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">Tactical Silence</h3>
                  <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest italic">No matching incident reports found in local cluster.</p>
               </motion.div>
             ) : (
               <AnimatePresence mode="popLayout">
                 {filteredAlerts.map((alert) => (
                   <motion.div
                     key={alert.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className={`relative overflow-hidden group bg-brand-dark border border-white/5 rounded-[40px] transition-all shadow-2xl ${
                       !alert.isRead ? 'ring-1 ring-brand-primary/20' : 'opacity-50'
                     }`}
                   >
                      <div className="p-10 flex gap-10">
                         {/* Icon */}
                         <div className={`w-20 h-20 shrink-0 rounded-[32px] flex items-center justify-center border shadow-inner ${
                           alert.severity === 'critical' ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger' :
                           alert.severity === 'warning' ? 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning' :
                           'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                         }`}>
                            {alert.severity === 'critical' ? <ShieldAlert className="w-10 h-10" /> :
                             alert.severity === 'warning' ? <AlertTriangle className="w-10 h-10" /> :
                             <Info className="w-10 h-10" />}
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-4">
                               <div className="flex items-center gap-4">
                                  <h3 className="text-2xl font-black tracking-tighter group-hover:text-brand-primary transition-colors uppercase italic">{alert.title}</h3>
                                  <span className="px-3 py-1 bg-brand-darker border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500">{alert.type}</span>
                               </div>
                               <span className="text-[10px] font-black text-gray-500 flex items-center gap-2 shrink-0 uppercase tracking-widest italic">
                                  <Clock className="w-3.5 h-3.5" />
                                  {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleTimeString() : 'Syncing...'}
                               </span>
                            </div>

                            <p className="text-gray-400 text-base font-medium leading-relaxed mb-6 italic">"{alert.message}"</p>

                            <div className="flex items-center justify-between">
                               {(alert.source && alert.destination) ? (
                                 <div className="items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-brand-darker px-5 py-2.5 rounded-full border border-white/5 inline-flex">
                                    <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                                    <span>{alert.source.split(',')[0]}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{alert.destination.split(',')[0]}</span>
                                 </div>
                               ) : <div />}

                               <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!alert.isRead && (
                                    <button 
                                      onClick={() => handleMarkRead(alert.id!)}
                                      className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-brand-primary/20"
                                    >
                                      <CheckCircle2 className="w-4 h-4" /> Resolve Log
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteAlert(alert.id!)}
                                    className="p-3 text-gray-600 hover:text-brand-danger hover:bg-brand-danger/10 rounded-2xl transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   </motion.div>
                 ))}
               </AnimatePresence>
             )}
          </div>

          {/* AI ENGINE STATUS */}
          <div className="p-10 bg-brand-dark border border-white/5 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
             <div className="flex items-center gap-8 relative z-10">
                <div className="p-6 bg-brand-primary/10 rounded-[32px] border border-brand-primary/20 shadow-inner">
                   <Database className="w-10 h-10 text-brand-primary" />
                </div>
                <div>
                   <h4 className="text-2xl font-black italic tracking-tighter mb-1">Threat Registry Cluster</h4>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] leading-none mt-2 italic">Scanning Global Logistics Vectors for Disruption Patterns</p>
                </div>
             </div>
             
             <div className="flex items-center gap-12 relative z-10">
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Confidence Level</p>
                   <p className="text-3xl font-black text-brand-success italic">99.8%</p>
                </div>
                <div className="w-px h-16 bg-white/5" />
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Heuristic Engine</p>
                   <div className="flex items-center gap-2 justify-end">
                      <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                      <p className="text-3xl font-black text-brand-primary italic uppercase tracking-tighter">Active</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
