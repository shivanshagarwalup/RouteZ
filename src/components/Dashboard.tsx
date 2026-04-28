import React from 'react';
import { Package, Clock, AlertOctagon, Timer } from 'lucide-react';
import { ShipmentData } from '@/lib/firestore';

interface DashboardProps {
  shipments: ShipmentData[];
}

export default function Dashboard({ shipments = [] }: DashboardProps) {
  // 1. Total Shipments
  const totalShipments = shipments.length;

  // 2. Disruptions (High Risk)
  const disruptions = shipments.filter(s => s.riskLevel === 'High').length;

  // 3. On-Time Delivery % (Low Risk as proxy for "good" shipments)
  const lowRiskCount = shipments.filter(s => s.riskLevel === 'Low').length;
  const onTimeDelivery = totalShipments > 0 
    ? ((lowRiskCount / totalShipments) * 100).toFixed(1) 
    : "0.0";

  // 4. Avg Delay
  // Heuristic: Extracting numeric hours from strings like "2.5 hours" or "4 hours"
  const totalDelayHours = shipments.reduce((acc, s) => {
    const match = s.estimatedDelay?.match(/([\d.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);
  const avgDelay = totalShipments > 0 
    ? (totalDelayHours / totalShipments).toFixed(1) 
    : "0.0";

  const stats = [
    { 
      title: "Total Shipments", 
      value: totalShipments.toLocaleString(), 
      trend: "+12%", trendUp: true, 
      icon: Package, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" 
    },
    { 
      title: "On-Time Est.", 
      value: `${onTimeDelivery}%`, 
      trend: "+0.5%", trendUp: true, 
      icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" 
    },
    { 
      title: "High Risk Alerts", 
      value: disruptions.toString(), 
      trend: disruptions > 0 ? `+${disruptions}` : "0", trendUp: false, 
      icon: AlertOctagon, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" 
    },
    { 
      title: "Avg. Risk Delay", 
      value: `${avgDelay} hrs`, 
      trend: "-10m", trendUp: true, 
      icon: Timer, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 flex items-center gap-5 shadow-xl hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-300 group cursor-default hover:-translate-y-1"
        >
          <div className={`p-4 rounded-xl ${stat.bg} border ${stat.border} transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
            <stat.icon className={`w-7 h-7 ${stat.color} drop-shadow-sm`} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">{stat.title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-100 tracking-tight">{stat.value}</p>
              <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.trendUp ? '↑' : '↓'} {stat.trend}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
