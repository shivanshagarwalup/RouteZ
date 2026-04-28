'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Info, Target, Zap, ShieldCheck, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30 overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 mb-8">
               <Info className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Intelligence Dossier</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8">
              ABOUT <br />
              <span className="text-blue-500">SUPPLY OPTIMIZER</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium italic leading-relaxed">
              SUPPLY OPTIMIZER is a next-generation logistics command center 
              powered by neural intelligence. We bridge the gap between static route planning 
              and dynamic environmental realities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glassmorphism p-8 rounded-[40px] border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-white/5">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter mb-4">Our Mission</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed italic">
                To eliminate logistical uncertainty through real-time predictive analytics 
                and atmospheric telemetry integration.
              </p>
            </div>

            <div className="glassmorphism p-8 rounded-[40px] border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-white/5">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter mb-4">Core Technology</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed italic">
                Utilizing advanced LPU (Language Processing Unit) architectures to parse 
                complex environmental risk vectors in milliseconds.
              </p>
            </div>
          </div>
          
          <div className="mt-20 p-12 glassmorphism rounded-[60px] border border-blue-500/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10" />
             <h2 className="text-3xl font-black italic tracking-tighter mb-6 text-center">Operational Philosophy</h2>
             <p className="text-gray-400 text-center text-lg italic leading-relaxed">
               "In the world of global logistics, data is the only fuel that never runs out. 
               We transform raw telemetry into tactical advantage."
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
