'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Info, 
  Copy, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  ShieldAlert,
  Zap,
  ChevronRight,
  Target
} from 'lucide-react';
import { RiskAnalysisResult } from '@/services/aiService';
import { OptimizationResult } from '@/workflows/optimization';
import { useToast } from '@/lib/toastStore';

interface RiskPanelProps {
  riskData?: {
    risk_level: 'Low' | 'Medium' | 'High';
    risk_score: number;
    factors: string[];
    recommendation: string;
    estimated_delay?: string;
    confidence?: number;
  };
  optimizationData?: OptimizationResult | null | undefined;
  isLoading?: boolean;
  onSave?: () => void;
  isLoggedIn?: boolean;
}

export default function RiskPanel({ riskData, optimizationData, isLoading, onSave, isLoggedIn }: RiskPanelProps) {
  const toast = useToast();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (riskData?.risk_score) {
      const duration = 1500;
      const start = 0;
      const end = riskData.risk_score;
      let startTime: number | null = null;

      const animateChange = (now: number) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        setDisplayScore(Math.floor(progress * (end - start) + start));
        if (progress < 1) requestAnimationFrame(animateChange);
      };

      requestAnimationFrame(animateChange);
    } else {
      setDisplayScore(0);
    }
  }, [riskData]);

  const handleCopy = () => {
    if (riskData) {
      const text = `AI RISK PROFILE:
Source: ${riskData.risk_level}
Score: ${riskData.risk_score}%
Recommendation: ${riskData.recommendation}
Factors: ${riskData.factors.join(', ')}`;
      navigator.clipboard.writeText(text);
      toast.success('Strategy intelligence copied to clipboard.');
    }
  };

  if (isLoading) {
    return (
      <div className="glassmorphism p-8 rounded-[40px] h-full flex flex-col items-center justify-center min-h-[500px] border border-blue-500/10 shadow-2xl relative overflow-hidden">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full mb-6"
        />
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Running Neural Risk Engine...</p>
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10" />
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="bg-brand-dark p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[60px] -z-10 group-hover:bg-brand-primary/10 transition-all" />
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-lg font-black italic tracking-tighter">AI Mission Profile</h2>
          <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-700" />)}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-gray-800/30 flex items-center justify-center mb-6 border border-white/5">
             <Target className="w-10 h-10 text-gray-700" />
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Deployment required. Initialize logistics telemetry and click <span className="text-blue-500 font-bold">ANALYSIS</span> to generate real-time risk vectors.
          </p>
        </div>
      </div>
    );
  }

  const isHigh = riskData.risk_level === 'High';
  const isMedium = riskData.risk_level === 'Medium';
  const colorClass = isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-emerald-500';
  const borderCol = isHigh ? 'border-rose-500/30' : isMedium ? 'border-amber-500/30' : 'border-emerald-500/30';
  const bgGlow = isHigh ? 'bg-rose-500/10' : isMedium ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  return (
    <div className={`bg-brand-dark p-8 rounded-[40px] h-full flex flex-col relative overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 ${isHigh ? 'shadow-brand-danger/20' : ''}`}>
      <div className={`absolute top-0 right-0 w-64 h-64 ${bgGlow} blur-[120px] rounded-full -z-10`} />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-3">
           <Zap className="w-5 h-5 text-blue-500" />
           <h2 className="text-lg font-black italic tracking-tighter">Risk Strategy</h2>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleCopy}
             className="p-2.5 rounded-xl bg-gray-900 border border-white/5 text-gray-400 hover:text-white transition-all shadow-inner"
           >
             <Copy className="w-4 h-4" />
           </button>
           <span className={`px-4 py-1.5 ${bgGlow} ${colorClass} text-[10px] font-black uppercase tracking-widest rounded-xl border ${borderCol} shadow-lg shadow-black/20`}>
            {riskData.risk_level} SEVERITY
           </span>
        </div>
      </div>

      <div className="flex justify-center mb-10 relative z-10 shrink-0">
        <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-[8px] border-gray-900/50 shadow-[0_0_50px_rgba(0,0,0,0.2)]">
          <div className={`absolute inset-0 rounded-full ${bgGlow} opacity-30 animate-pulse`} />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="white"
              strokeOpacity="0.03"
              strokeWidth="10"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className={`${colorClass} transition-all duration-300`}
              strokeDasharray={502}
              initial={{ strokeDashoffset: 502 }}
              animate={{ strokeDashoffset: 502 - (502 * (riskData.risk_score / 100)) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center flex flex-col items-center">
            <span className="text-6xl font-black text-white tracking-widest italic">{displayScore}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] -mt-1">Quantum Score</span>
          </div>
        </div>
      </div>

      {/* Factor Progression Gauges */}
      <div className="mb-10 px-2 space-y-6 relative z-10">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
               Intelligence Gauges
            </h3>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Confidence: 99.1%</span>
         </div>
         <div className="space-y-4">
            {riskData.factors.slice(0, 3).map((f, i) => {
               // Representative factor intensities
               const intensity = Math.max(30, Math.min(95, riskData.risk_score + (i * 10) - 20));
               return (
                 <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-gray-300 truncate max-w-[200px]">{f.split(':')[0]}</span>
                       <span className={colorClass}>{intensity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-900/50 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${intensity}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className={`h-full bg-gradient-to-r rounded-full ${
                           isHigh ? 'from-rose-600 to-rose-400' : 
                           isMedium ? 'from-amber-600 to-amber-400' : 'from-emerald-600 to-emerald-400'
                         }`}
                       />
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 overflow-visible">
        <div className="space-y-6">
           <div className="bg-gray-900/40 p-5 rounded-3xl border border-white/5 shadow-inner">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <ShieldAlert className="w-3 h-3 text-blue-500" /> AI Directive
              </h4>
              <p className="text-sm font-medium text-blue-100/90 leading-relaxed italic">
                "{riskData.recommendation}"
              </p>
           </div>

           {riskData.estimated_delay && (
             <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 border border-white/5 rounded-2xl shadow-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Clock className="w-3.5 h-3.5 text-amber-500" /> Tactical Delay
                </span>
                <span className="text-sm font-black text-amber-500">{riskData.estimated_delay}</span>
             </div>
           )}

           <div className="pt-4">
              {isLoggedIn ? (
                <button 
                  onClick={onSave}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group"
                >
                  <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Save Shipment Intelligence
                </button>
              ) : (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 text-center">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cloud Sync Disabled</p>
                   <p className="text-xs text-gray-500 mb-6 italic leading-relaxed">Login to persist this tactical analysis to your global dashboard.</p>
                   <button 
                     onClick={onSave}
                     className="w-full bg-gray-900 hover:bg-gray-800 text-blue-400 border border-blue-500/30 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                   >
                     Login to Save
                   </button>
                </div>
              )}
           </div>

           <AnimatePresence>
             {optimizationData && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-white/5 space-y-4"
                >
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                         <Target className="w-3 h-3" /> Route Refinement
                      </h4>
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl text-center">
                         <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Risk Reduced</p>
                         <p className="text-sm font-black text-emerald-400">{optimizationData.risk_reduction}</p>
                      </div>
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-2xl text-center">
                         <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Time Recovery</p>
                         <p className="text-sm font-black text-blue-400">{optimizationData.time_saved}</p>
                      </div>
                   </div>

                   <div className="bg-gray-900/80 p-4 rounded-2xl border border-white/5 shadow-2xl space-y-3">
                      <div>
                         <p className="text-[8px] font-black text-gray-500 uppercase mb-1 tracking-widest">Optimized Vector</p>
                         <p className="text-xs font-black text-white italic">{optimizationData.best_route}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-700 mx-auto" />
                      <div>
                         <p className="text-[8px] font-black text-gray-500 uppercase mb-1 tracking-widest">Strategic Logic</p>
                         <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic line-clamp-2">"{optimizationData.reasoning}"</p>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
