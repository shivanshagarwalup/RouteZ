'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Users, ShieldAlert, Globe, 
  ArrowUpRight, Download, Filter, 
  ChevronDown, Search, ArrowUpDown, 
  Database, Zap, Clock, Box, Activity,
  Target, BarChart3, Scan
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AIMissionAssistant from '@/components/AIMissionAssistant';
import { useAuth } from '@/lib/authContext';
import { getUserShipments, ShipmentData } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  chart: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
};

// CUSTOM HUD TOOLTIP
const HUDTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-darker/90 backdrop-blur-xl border border-brand-primary/20 p-4 rounded-2xl shadow-2xl min-w-[160px]">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-gray-300 uppercase">{entry.name}:</span>
              <span className="text-xs font-black" style={{ color: entry.color || entry.fill }}>
                {entry.value}{entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof ShipmentData>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user?.uid]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getUserShipments(user!.uid);
      setShipments(data as ShipmentData[]);
    } catch (err) {
      toast.error('Failed to sync network data.');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (shipments.length === 0) return { total: 0, avgRisk: 0, onTime: 0, distance: 0 };
    const totalDist = shipments.reduce((acc, s) => acc + (s.distance || 0), 0);
    const avgRisk = Math.round(shipments.reduce((acc, s) => acc + s.riskScore, 0) / shipments.length);
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const onTimeRate = (delivered + delayed) > 0 ? Math.round((delivered / (delivered + delayed)) * 100) : 100;
    return { total: shipments.length, avgRisk, onTime: onTimeRate, distance: totalDist };
  }, [shipments]);

  // RADAR DATA: Operational Balance
  const radarData = useMemo(() => [
    { subject: 'Speed', A: 85, fullMark: 100 },
    { subject: 'Safety', A: 94, fullMark: 100 },
    { subject: 'Risk', A: 100 - stats.avgRisk, fullMark: 100 },
    { subject: 'Efficiency', A: stats.onTime, fullMark: 100 },
    { subject: 'Range', A: 78, fullMark: 100 },
  ], [stats]);

  const riskTrendData = useMemo(() => {
    return [...shipments].reverse().slice(-12).map(s => ({
      name: s.destination.split(',')[0],
      score: s.riskScore,
      date: s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'N/A'
    }));
  }, [shipments]);

  const statusData = useMemo(() => {
    const counts = shipments.reduce((acc: any, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key.toUpperCase(), value: counts[key] }));
  }, [shipments]);

  const sparklineData = useMemo(() => {
    return [...shipments].reverse().slice(-8).map(s => ({ val: s.riskScore }));
  }, [shipments]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center">
         <motion.div 
           animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
           transition={{ duration: 1.5, repeat: Infinity }} 
           className="w-16 h-16 border-4 border-brand-primary/10 border-t-brand-primary rounded-3xl mb-6 shadow-2xl shadow-brand-primary/20" 
         />
         <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.5em] italic">Synthesizing Network Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                    <BarChart3 className="w-5 h-5 text-brand-primary" />
                 </div>
                 <h1 className="text-4xl font-black tracking-tighter italic">Analytics Hub</h1>
              </div>
              <p className="text-gray-400 font-medium italic text-sm">Quantifying global logistics vectors and operational throughput.</p>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3.5 bg-brand-dark border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all group">
                  <Filter className="w-4 h-4 text-brand-primary group-hover:rotate-180 transition-transform duration-500" /> 
                  Tactical Range: 30D
               </button>
               <button className="px-6 py-3.5 bg-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-brand-primary/80 shadow-2xl shadow-brand-primary/20 transition-all active:scale-95">
                  <Download className="w-4 h-4" /> Export Protocol
               </button>
            </div>
          </div>

          {/* STATS WITH SPARKLINES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: 'Fleet Throughput', value: stats.total, icon: Box, color: 'text-brand-primary', bg: 'bg-brand-primary/10', sub: 'Active Nodes' },
               { label: 'Risk Magnitude', value: `${stats.avgRisk}%`, icon: ShieldAlert, color: 'text-brand-danger', bg: 'bg-brand-danger/10', sub: 'Network Avg' },
               { label: 'Delivery Precision', value: `${stats.onTime}%`, icon: Activity, color: 'text-brand-success', bg: 'bg-brand-success/10', sub: 'Tactical Accuracy' },
               { label: 'Logistics Reach', value: `${(stats.distance / 1000).toFixed(1)}k`, icon: Globe, color: 'text-brand-accent', bg: 'bg-brand-accent/10', sub: 'Vector Coverage' }
             ].map((stat, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-brand-dark border border-white/5 p-8 rounded-[40px] shadow-2xl card-hover relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner`}>
                           <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div className="h-12 w-20">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                 <Line type="monotone" dataKey="val" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 leading-none">{stat.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter">{stat.value}</p>
                        <p className="text-[9px] font-bold text-gray-500 mt-2 uppercase italic tracking-widest flex items-center gap-2">
                           <TrendingUp className="w-3 h-3 text-brand-success" /> {stat.sub}
                        </p>
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </motion.div>
             ))}
          </div>

          {/* MAIN CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* AREA CHART: RISK TREND */}
             <div className="lg:col-span-8 bg-brand-dark border border-white/5 p-10 rounded-[48px] shadow-2xl h-[520px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[120px] rounded-full" />
                <div className="flex justify-between items-center mb-10 relative z-10">
                   <h3 className="text-xl font-black italic flex items-center gap-4">
                      <div className="w-2 h-6 bg-brand-primary rounded-full" />
                      Temporal Risk Vector Analysis
                   </h3>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Encrypted Data Sync</span>
                </div>
                <div className="flex-1 min-h-0 relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskTrendData}>
                         <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                         <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                         <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                         <Tooltip content={<HUDTooltip />} />
                         <Area 
                           name="Risk Index"
                           type="monotone" 
                           dataKey="score" 
                           stroke="#3b82f6" 
                           strokeWidth={4} 
                           fillOpacity={1} 
                           fill="url(#areaGrad)" 
                           activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }}
                         />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* RADAR CHART: BALANCE */}
             <div className="lg:col-span-4 bg-brand-dark border border-white/5 p-10 rounded-[48px] shadow-2xl h-[520px] flex flex-col relative overflow-hidden">
                <h3 className="text-xl font-black italic flex items-center gap-4 mb-10">
                   <Scan className="w-6 h-6 text-brand-accent" /> Fleet Balance
                </h3>
                <div className="flex-1 min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                         <PolarGrid stroke="#ffffff10" />
                         <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={10} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar
                           name="Fleet Balance"
                           dataKey="A"
                           stroke="#06b6d4"
                           fill="#06b6d4"
                           fillOpacity={0.3}
                         />
                         <Tooltip content={<HUDTooltip />} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest mt-4 italic leading-relaxed">
                   AI-Driven Performance Balance Matrix
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* PIE CHART */}
             <div className="bg-brand-dark border border-white/5 p-10 rounded-[48px] shadow-2xl h-[480px] flex flex-col relative overflow-hidden">
                <h3 className="text-xl font-black italic flex items-center gap-4 mb-10">
                   <Database className="w-6 h-6 text-brand-secondary" /> Network Status Distribution
                </h3>
                <div className="flex-1 min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={statusData} innerRadius={100} outerRadius={140} paddingAngle={12} dataKey="value">
                           {statusData.map((entry, index) => (
                             <Cell key={index} fill={COLORS.chart[index % COLORS.chart.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={4} />
                           ))}
                         </Pie>
                         <Tooltip content={<HUDTooltip />} />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* BAR CHART */}
             <div className="bg-brand-dark border border-white/5 p-10 rounded-[48px] shadow-2xl h-[480px] flex flex-col relative overflow-hidden">
                <h3 className="text-xl font-black italic flex items-center gap-4 mb-10">
                   <Activity className="w-6 h-6 text-brand-success" /> Fleet Activity Magnitude
                </h3>
                <div className="flex-1 min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskTrendData.slice(-8)}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                         <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip content={<HUDTooltip />} cursor={{ fill: '#ffffff05' }} />
                         <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                            {riskTrendData.map((entry, index) => (
                               <Cell key={index} fill={entry.score > 70 ? COLORS.high : entry.score > 30 ? COLORS.medium : COLORS.low} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

        </div>
      </main>
      <AIMissionAssistant />
    </div>
  );
}
