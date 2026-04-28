'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Send, Loader2, Sparkles } from 'lucide-react';

interface ShipmentFormProps {
  onAnalyze?: (source: string, destination: string, shipmentType: string) => void;
  isLoading?: boolean;
}

export default function ShipmentForm({ onAnalyze, isLoading }: ShipmentFormProps) {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [shipmentType, setShipmentType] = useState('Standard');

  const handleAnalyze = () => {
    if (onAnalyze && source && dest) {
      onAnalyze(source, dest, shipmentType);
    }
  };

  return (
    <div className="bg-brand-dark p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[60px] -z-10 group-hover:bg-brand-primary/10 transition-all" />
      
      <div className="flex items-center gap-3 mb-8">
         <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
            <Navigation className="w-5 h-5 text-blue-400" />
         </div>
         <div>
            <h2 className="text-xl font-black italic tracking-tighter text-white">Strategic Vector</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none mt-1">Operational Parameters</p>
         </div>
      </div>

      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
             <MapPin className="w-3 h-3 text-blue-500" /> Origin Point
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Source City (e.g. London)" 
              className="w-full bg-gray-900/50 border border-white/5 rounded-2xl py-4 px-5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium italic" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
             <Target className="w-3 h-3 text-rose-500" /> Destination Hub
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              placeholder="Target City (e.g. Berlin)" 
              className="w-full bg-gray-900/50 border border-white/5 rounded-2xl py-4 px-5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all font-medium italic" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
             Cargo Classification
          </label>
          <select 
            value={shipmentType}
            onChange={(e) => setShipmentType(e.target.value)}
            className="w-full bg-gray-900/50 border border-white/5 rounded-2xl py-4 px-5 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer font-bold italic"
          >
            <option value="Standard">Standard Ops</option>
            <option value="Express">Priority Vector</option>
            <option value="Fragile">Sensitive Cargo</option>
            <option value="Hazardous">High-Risk Payload</option>
          </select>
        </div>

        <button 
          type="button" 
          onClick={handleAnalyze}
          disabled={isLoading || !source || !dest}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-white/5 border border-blue-400/20 text-white py-5 rounded-[20px] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Synching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Initialize Analysis</span>
              <Send className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

import { Target } from 'lucide-react';
