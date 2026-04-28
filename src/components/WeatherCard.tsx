'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer, Wind, Droplets, Eye, CloudRain, Sun, Cloud, CloudLightning, Snowflake, CloudFog } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';

interface WeatherCardProps {
  weather: WeatherData;
  label: string;
}

const getEmojiIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return { emoji: '☀️', icon: <Sun className="text-yellow-400" /> };
  if (c.includes('thunderstorm')) return { emoji: '⛈️', icon: <CloudLightning className="text-purple-400" /> };
  if (c.includes('rain') || c.includes('drizzle')) return { emoji: '🌧️', icon: <CloudRain className="text-blue-400" /> };
  if (c.includes('snow')) return { emoji: '🌨️', icon: <Snowflake className="text-white" /> };
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return { emoji: '🌫️', icon: <CloudFog className="text-gray-300" /> };
  if (c.includes('cloud')) return { emoji: '🌥️', icon: <Cloud className="text-gray-400" /> };
  return { emoji: '🌡️', icon: <Sun className="text-orange-400" /> };
};

const getTempColor = (temp: number) => {
  if (temp <= 10) return 'text-blue-400';
  if (temp > 10 && temp <= 25) return 'text-emerald-400';
  if (temp > 25 && temp <= 35) return 'text-orange-400';
  return 'text-rose-500';
};

export default function WeatherCard({ weather, label }: WeatherCardProps) {
  const { emoji, icon } = getEmojiIcon(weather.condition);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
              {label} Intelligence
            </span>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="text-xl font-black text-white">{weather.city}</h3>
            </div>
          </div>
          <div className="text-4xl">{emoji}</div>
        </div>

        <div className="flex items-end gap-3 mb-8">
          <span className={`text-6xl font-black tracking-tighter ${getTempColor(weather.temperature)}`}>
            {weather.temperature}°
          </span>
          <div className="mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Feels like</p>
            <p className="text-lg font-black text-white">{weather.feelsLike}°C</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wind</span>
            </div>
            <p className="text-sm font-black text-white">{weather.windSpeed} km/h</p>
          </div>

          <div className="bg-gray-900/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Humidity</span>
            </div>
            <p className="text-sm font-black text-white">{weather.humidity}%</p>
          </div>

          <div className="bg-gray-900/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Visibility</span>
            </div>
            <p className="text-sm font-black text-white">{weather.visibility} km</p>
          </div>

          <div className="bg-gray-900/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Condition</span>
            </div>
            <p className="text-sm font-black text-white capitalize line-clamp-1">{weather.condition}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
