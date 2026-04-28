'use client';

import React from 'react';
import { 
  Activity, 
  MapPin, 
  Zap, 
  Navigation, 
  Clock, 
  Share2, 
  XCircle,
  TrendingUp,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackingPoint } from '@/hooks/useRealTimeTracking';

interface TrackingPanelProps {
  progress: number;
  currentPosition: [number, number] | null;
  eta: string;
  trackingHistory: TrackingPoint[];
  onStop: () => void;
}

export default function TrackingPanel({
  progress,
  currentPosition,
  eta,
  trackingHistory,
  onStop
}: TrackingPanelProps) {
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Tracking link copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glassmorphism p-6 rounded-[30px] border border-white/5 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                className="text-blue-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black italic">{progress}%</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Route Progress</p>
        </div>

        <div className="glassmorphism p-6 rounded-[30px] border border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/10">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Time to Arrival</p>
              <p className="text-xl font-black text-white italic">{eta}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">On Schedule</span>
          </div>
        </div>
      </div>

      {/* POSITION & SPEED */}
      <div className="glassmorphism p-6 rounded-[40px] border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
               <Navigation className="w-4 h-4" />
             </div>
             <h3 className="text-sm font-black italic uppercase tracking-widest">Real-time Vector</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Current Speed</p>
              <p className="text-sm font-black text-emerald-400 italic">
                {trackingHistory.length > 0 ? trackingHistory[trackingHistory.length - 1].speed : 0} <span className="text-[10px]">KM/H</span>
              </p>
            </div>
          </div>
        </div>

        {currentPosition && (
          <div className="p-4 bg-gray-900/50 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <MapPin className="w-4 h-4 text-gray-500" />
               <code className="text-xs font-bold text-gray-300">
                 {currentPosition[0].toFixed(4)}°N, {currentPosition[1].toFixed(4)}°E
               </code>
            </div>
            <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* TRACKING HISTORY TIMELINE */}
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
           <History className="w-4 h-4 text-gray-500" />
           <h3 className="text-[10px] font-black italic uppercase tracking-[0.3em] text-gray-400">Tactical Feed</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[300px]">
          <AnimatePresence initial={false}>
            {[...trackingHistory].reverse().slice(0, 10).map((point, i) => (
              <motion.div
                key={point.timestamp.getTime()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gray-900/30 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-gray-700'}`} />
                  <div>
                    <p className="text-[10px] font-black text-white italic mb-0.5">{point.status}</p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                      {point.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-black text-blue-400">{point.speed} KM/H</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/5">
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-3 py-4 bg-gray-900 hover:bg-gray-800 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          Share Vector
        </button>
        <button 
          onClick={onStop}
          className="flex items-center justify-center gap-3 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 transition-all shadow-inner"
        >
          <XCircle className="w-4 h-4" />
          Abort Feed
        </button>
      </div>
    </div>
  );
}
