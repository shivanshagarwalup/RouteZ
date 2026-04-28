import React from 'react';
import { History, Eye, MapPin, Calendar } from 'lucide-react';
import { ShipmentData } from '@/lib/firestore';

interface HistoryListProps {
  shipments: ShipmentData[];
  onInspect: (shipment: ShipmentData) => void;
  selectedId?: string;
}

export default function HistoryList({ shipments, onInspect, selectedId }: HistoryListProps) {
  return (
    <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50 flex flex-col h-full shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
          <History className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-100 tracking-tight">Recent Shipments</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {shipments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-4">
             <div className="w-12 h-12 rounded-full bg-gray-700/30 flex items-center justify-center mb-3">
                <History className="w-6 h-6 opacity-20" />
             </div>
             <p className="text-sm">No analysis history found.</p>
          </div>
        ) : (
          shipments.map((s) => {
            const isSelected = selectedId === s.id;
            const riskColor = s.riskLevel === 'High' ? 'text-red-400' : s.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-emerald-400';
            const riskBg = s.riskLevel === 'High' ? 'bg-red-400/10 border-red-400/20' : s.riskLevel === 'Medium' ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-emerald-400/10 border-emerald-400/20';

            return (
              <div 
                key={s.id}
                onClick={() => onInspect(s)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                    : 'bg-gray-900/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${riskBg} ${riskColor}`}>
                    {s.riskLevel} Risk
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold">
                    <Calendar className="w-3 h-3" />
                    {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <span className="text-xs text-gray-300 font-medium truncate">{s.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                    <span className="text-xs text-gray-300 font-medium truncate">{s.destination}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{s.shipmentType}</span>
                  <button className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-blue-400'}`}>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
