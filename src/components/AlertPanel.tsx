import React from 'react';
import { AlertCircle, CloudRain, ShieldAlert, BellRing } from 'lucide-react';

export default function AlertPanel() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50 h-full flex flex-col shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
          <BellRing className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-100 tracking-tight">Active Intelligence</h2>
      </div>
      
      <div className="space-y-4 flex-1">
        {/* Critical Alert with Pulse */}
        <div className="group relative p-4 bg-red-500/5 border border-red-500/20 border-l-4 border-l-red-500 rounded-r-xl flex gap-4 items-start transition-all hover:bg-red-500/10 hover:border-red-500/30 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
          <div className="bg-red-500/20 p-2.5 rounded-xl shrink-0 border border-red-500/30 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-red-100">Port Strike Ahead</h4>
              <span className="px-1.5 py-0.5 bg-red-500 text-[9px] font-black uppercase rounded text-white animate-pulse">Critical</span>
            </div>
            <p className="text-xs text-red-200/70 leading-relaxed font-medium">Expected union strike at Los Angeles port in 3 days. Rerouting is highly advised.</p>
          </div>
        </div>
        
        {/* Warning Alert */}
        <div className="group p-4 bg-blue-500/5 border border-blue-500/20 border-l-4 border-l-blue-500 rounded-r-xl flex gap-4 items-start transition-all hover:bg-blue-500/10 hover:border-blue-500/30">
          <div className="bg-blue-500/20 p-2.5 rounded-xl shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <CloudRain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-100 mb-1">Severe Weather Warning</h4>
            <p className="text-xs text-blue-200/70 leading-relaxed font-medium">Snowfall increasing risk for northern routes over the next 48 hours.</p>
          </div>
        </div>
        
        {/* Informational Alert */}
        <div className="group p-4 bg-amber-500/5 border border-amber-500/20 border-l-4 border-l-amber-500 rounded-r-xl flex gap-4 items-start transition-all hover:bg-amber-500/10 hover:border-amber-500/30">
          <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-100 mb-1">Supply Shortage</h4>
            <p className="text-xs text-amber-200/70 leading-relaxed font-medium">Packaging materials running 15% below threshold at origin warehouse.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
