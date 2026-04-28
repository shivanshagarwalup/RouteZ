'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2, MessageSquare, Zap, ShieldAlert, Cpu } from 'lucide-react';

export default function AIMissionAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'RouteZ Intelligence Hub active. Awaiting tactical query.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Analyzing network vectors... Recommendation: Optimize Path-B to avoid upcoming atmospheric turbulence near Hub-7.' 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 h-[500px] bg-brand-dark border border-brand-primary/20 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* HEADER */}
            <div className="p-6 bg-brand-primary/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
                    <Cpu className="w-5 h-5 text-brand-primary" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black italic tracking-tighter">AI Mission Assistant</h4>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                       <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Neural Link Active</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-brand-primary text-white rounded-tr-none' 
                    : 'bg-brand-darker border border-white/5 text-gray-300 rounded-tl-none italic'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* INPUT */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-brand-darker/50">
               <div className="relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter tactical query..."
                    className="w-full bg-brand-dark border border-white/5 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-brand-primary/40 transition-all font-medium italic"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-lg transition-all">
                     <Send className="w-4 h-4 text-brand-primary" />
                  </button>
               </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)] border border-white/20 group relative"
          >
             <div className="absolute inset-0 bg-brand-primary rounded-2xl animate-ping opacity-20 pointer-events-none" />
             <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
