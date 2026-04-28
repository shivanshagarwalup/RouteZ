'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, ShieldAlert, Thermometer, Wind } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';
import WeatherCard from './WeatherCard';

interface WeatherComparisonProps {
  sourceWeather: WeatherData;
  destWeather: WeatherData;
}

export default function WeatherComparison({ sourceWeather, destWeather }: WeatherComparisonProps) {
  const tempDiff = Math.abs(sourceWeather.temperature - destWeather.temperature);
  const maxWind = Math.max(sourceWeather.windSpeed, destWeather.windSpeed);
  
  const warnings = [];
  if (tempDiff > 20) warnings.push(`Severe thermal delta detected (${tempDiff}°C difference). Cargo stability may be affected.`);
  if (maxWind > 50) warnings.push(`High wind warning (${maxWind} km/h). Structural and route stability risk.`);
  if (sourceWeather.condition.includes('storm') || destWeather.condition.includes('storm')) {
    warnings.push('Severe thunderstorm advisory active on route.');
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-white flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-blue-400" />
          Environmental Intelligence Sync
        </h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold bg-gray-800/50 px-3 py-1.5 rounded-xl border border-white/5">
          <span>{sourceWeather.city}</span>
          <ArrowRight className="w-4 h-4" />
          <span>{destWeather.city}</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col gap-3"
        >
          {warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-black italic">{warning}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeatherCard weather={sourceWeather} label="Origin" />
        <WeatherCard weather={destWeather} label="Destination" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-gray-800/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                  <Thermometer className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Temperature Delta</p>
                  <p className="text-lg font-black text-white">{tempDiff}°C Variance</p>
               </div>
            </div>
            <div className={`text-xs font-black uppercase px-3 py-1 rounded-full ${tempDiff > 15 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
               {tempDiff > 15 ? 'Critical' : 'Stable'}
            </div>
         </div>

         <div className="bg-gray-800/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <Wind className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Wind Velocity</p>
                  <p className="text-lg font-black text-white">{maxWind} km/h Peak</p>
               </div>
            </div>
            <div className={`text-xs font-black uppercase px-3 py-1 rounded-full ${maxWind > 40 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
               {maxWind > 40 ? 'High Speed' : 'Moderate'}
            </div>
         </div>
      </div>
    </div>
  );
}
