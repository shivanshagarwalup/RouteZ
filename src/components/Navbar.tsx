'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
  ShieldCheck,
  Globe,
  Info,
  Sparkles,
  Navigation
} from 'lucide-react';
import { getUserAlerts, Alert } from '@/lib/firestore';
import { useToast } from '@/lib/toastStore';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const fetchCount = async () => {
        try {
          const alerts = await getUserAlerts(user.uid);
          setUnreadCount(alerts.filter(a => !a.isRead).length);
        } catch (e) {}
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.uid, pathname]);

  const navLinks = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Tracking', href: '/tracking', icon: Navigation },
    { name: 'Alerts', href: '/alerts', icon: Bell, count: unreadCount },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Tracking', href: '/tracking', icon: Globe },
    { name: 'Mission Parameters', href: '/#features', icon: Sparkles },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="h-20 border-b border-white/5 bg-brand-darker/70 backdrop-blur-2xl flex items-center px-8 sticky top-0 z-[100] shadow-2xl">
      <div className="flex items-center gap-12 w-full max-w-[1920px] mx-auto">
        
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/20 border border-white/10 group-hover:scale-105 transition-transform duration-500">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="hidden lg:block">
             <h1 className="text-2xl font-black italic tracking-tighter text-white">
               RouteZ
             </h1>
             <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] leading-none mt-1">Intelligent Logistics</p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative group h-12 ${
                  isActive 
                    ? 'text-white bg-white/5 shadow-inner' 
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <link.icon className={`w-4 h-4 transition-all duration-500 group-hover:scale-110 ${isActive ? 'text-brand-primary' : 'text-gray-500'}`} />
                {link.name}
                
                {isActive && (
                  <motion.div 
                    layoutId="navbar-active"
                    className="absolute inset-0 border border-brand-primary/20 rounded-2xl bg-brand-primary/5 -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {link.count !== undefined && link.count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-danger text-[8px] font-black items-center justify-center text-white border border-brand-darker">
                       {link.count}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="ml-auto flex items-center gap-6">
          <div className={`hidden lg:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl border shadow-inner transition-all italic ${
            user ? 'text-brand-success bg-brand-success/5 border-brand-success/10' : 'text-brand-primary bg-brand-primary/5 border-brand-primary/10'
          }`}>
            {user ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span className="opacity-80">{user ? 'Tactical Shield: Online' : 'Observer Access'}</span>
          </div>

          {user ? (
            /* USER REGISTRY DROPDOWN */
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all border border-white/5 bg-brand-dark shadow-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-darker border border-white/5 flex items-center justify-center overflow-hidden shadow-inner">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="User" />
                   ) : (
                     <UserIcon className="w-4 h-4 text-brand-primary" />
                   )}
                </div>
                <div className="hidden sm:block text-left mr-1">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Operator</p>
                   <p className="text-xs font-black text-white italic truncate max-w-[120px]">{user?.email?.split('@')[0]}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-500 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-72 bg-brand-darker/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] p-3 z-[110]"
                  >
                    <div className="p-5 border-b border-white/5 mb-2">
                       <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 px-1 italic">Identity Signature</p>
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-white truncate italic">{user?.email}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link 
                        href="/shipments"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                      >
                        <Package className="w-4 h-4 text-gray-600 group-hover:text-brand-primary" />
                        Operational Registry
                      </Link>
                    </div>

                    <div className="px-2 pt-2 border-t border-white/5 mt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-danger hover:bg-brand-danger/10 transition-all shadow-inner"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminate Sync
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary hover:bg-brand-primary/80 transition-all shadow-2xl shadow-brand-primary/20"
              >
                Initiate Access
              </Link>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 bg-brand-dark rounded-2xl border border-white/10"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION HUB */}
      <AnimatePresence>
         {isMobileMenuOpen && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="absolute top-20 left-0 right-0 bg-brand-darker/95 backdrop-blur-3xl border-b border-white/5 z-50 overflow-hidden md:hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
           >
              <div className="p-8 flex flex-col gap-4">
                 {navLinks.map((link) => {
                   const isActive = pathname === link.href;
                   return (
                     <Link
                       key={link.name}
                       href={link.href}
                       onClick={() => setIsMobileMenuOpen(false)}
                       className={`flex items-center justify-between px-8 py-6 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all ${
                         isActive 
                           ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/30' 
                           : 'bg-brand-dark border border-white/5 text-gray-500'
                       }`}
                     >
                       <div className="flex items-center gap-5">
                         <link.icon className="w-5 h-5" />
                         {link.name}
                       </div>
                       <ChevronRight className="w-4 h-4 opacity-50" />
                     </Link>
                   );
                 })}
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
}
