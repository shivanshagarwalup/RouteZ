'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Navigation, 
  Bell, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Live Tracking', href: '/tracking', icon: Navigation },
    { name: 'Alerts', href: '/alerts', icon: Bell },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <div className="lg:hidden fixed top-6 left-6 z-[150]">
         <button 
           onClick={() => setIsMobileOpen(!isMobileOpen)}
           className="p-3 bg-brand-dark border border-white/10 rounded-2xl text-white shadow-2xl active:scale-95 transition-transform"
         >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* BACKDROP FOR MOBILE */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 260,
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0)
        }}
        className={`fixed lg:sticky top-0 h-screen bg-brand-darker border-r border-white/5 flex flex-col z-[100] transition-all duration-300 ease-in-out shadow-2xl ${isMobileOpen ? 'w-[260px] translate-x-0' : ''}`}
      >
        {/* LOGO */}
        <div className="h-24 flex items-center px-6 mb-4">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <span className="text-2xl font-black text-white italic">Z</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-xl font-black italic tracking-tighter text-white">RouteZ</h1>
                <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em] leading-none">Intelligence Hub</p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary shadow-inner border border-brand-primary/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-primary' : ''}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER & TOGGLE */}
        <div className="p-4 border-t border-white/5 space-y-4">
          {user && (!isCollapsed || isMobileOpen) && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                 {user.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-xs font-black text-gray-400 font-mono">{user.email?.[0].toUpperCase()}</span>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Operator</p>
                 <p className="text-xs font-black text-white truncate italic">{user.email?.split('@')[0]}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-brand-danger transition-colors">
                 <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-gray-500 transition-all group"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
