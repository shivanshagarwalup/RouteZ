'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  CloudRain, 
  Navigation, 
  History,
  Globe,
  Database,
  Cpu,
  MousePointer2
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'Neural Risk Grid',
      description: 'Quantum-grade neural analysis of environmental and logistical risk vectors.',
      icon: ShieldCheck,
      color: 'text-brand-primary',
      bg: 'bg-brand-primary/10'
    },
    {
      title: 'Atmospheric Sync',
      description: 'Live atmospheric telemetry integrated directly into your supply chain route.',
      icon: CloudRain,
      color: 'text-brand-warning',
      bg: 'bg-brand-warning/10'
    },
    {
      title: 'Refined Pathfinding',
      description: 'Strategic path refinement to minimize delays and maximize operational efficiency.',
      icon: Navigation,
      color: 'text-brand-success',
      bg: 'bg-brand-success/10'
    },
    {
      title: 'Global Registry',
      description: 'Persist your mission-critical shipment data to a secure global dashboard.',
      icon: Database,
      color: 'text-brand-accent',
      bg: 'bg-brand-accent/10',
      badge: 'Account Required'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-darker text-white selection:bg-brand-primary/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 h-24 flex items-center justify-between px-8 lg:px-16 border-b border-white/5 bg-brand-darker/50 backdrop-blur-xl">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl border border-white/10">
              <span className="text-2xl font-black text-white italic">Z</span>
           </div>
           <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">RouteZ</h1>
              <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] mt-1">Intelligence Protocol</p>
           </div>
        </div>
        <div className="flex items-center gap-10">
           <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">Dashboard</Link>
           <Link href="/login" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5 transition-all shadow-xl shadow-brand-primary/5">Login System</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-40 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-brand-primary/5 border border-brand-primary/20 mb-12 shadow-2xl">
               <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Tactical Intelligence v4.0 Active</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black italic mb-10 leading-[1.1] px-10 tracking-tight">
              STRATEGIC <br />
              <span className="bg-gradient-to-r from-brand-primary via-blue-400 to-brand-secondary bg-clip-text text-transparent">LOGISTICS VECTOR</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-16 italic">
              Empowering global supply chains with real-time neural risk analysis, 
              atmospheric telemetry, and high-fidelity pathfinding intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link 
                href="/dashboard"
                className="group relative px-12 py-6 bg-brand-primary hover:bg-brand-primary/80 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_30px_60px_-15px_rgba(59,130,246,0.4)] overflow-hidden active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Launch Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </Link>
              
              <Link 
                href="/signup"
                className="px-12 py-6 bg-brand-dark hover:bg-brand-dark/80 border border-white/5 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95"
              >
                Request Authorization
              </Link>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-12 pt-8 border-t border-white/5 max-w-xl mx-auto opacity-40">
               <div className="flex flex-col items-center gap-2">
                  <Globe className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Global Ops</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Cpu className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Neural Sync</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Live Feed</span>
               </div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div id="features" className="mt-48 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="bg-brand-dark p-10 rounded-[48px] text-left border border-white/5 hover:border-brand-primary/30 transition-all group shadow-2xl relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-[24px] ${f.bg} flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 transition-transform shadow-inner`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter mb-5 text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 italic">"{f.description}"</p>
                {f.badge && (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full text-gray-500 border border-white/5">
                    {f.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="relative z-10 py-48 px-8 border-t border-white/5 mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
            <Activity className="w-16 h-16 text-brand-primary mx-auto mb-10 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-full" />
            <h2 className="text-4xl md:text-6xl font-black italic mb-10 leading-[1.2] px-10 tracking-tight">
              REVOLUTIONIZE <br />
              <span className="text-brand-primary">YOUR LOGISTICS VECTOR</span>
            </h2>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-6 text-brand-primary hover:text-white transition-all group"
            >
               <span className="text-xl font-black uppercase tracking-[0.3em]">Launch Platform</span>
               <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform duration-500" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 py-16 border-t border-white/5 text-center bg-brand-darker">
         <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center border border-brand-primary/20">
               <span className="text-xs font-black text-brand-primary italic">Z</span>
            </div>
            <span className="text-sm font-black italic text-gray-400">RouteZ Intelligence</span>
         </div>
         <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">© 2026 ROUTEZ OPERATIONS • Tactical Logistics Intelligence • Verified Platform</p>
      </footer>
    </div>
  );
}
