'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 6) {
      setError('Vector access requires at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to codify account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate via Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center p-4 overflow-hidden relative selection:bg-brand-primary/30">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
      
      {/* Animating blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* App Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-gradient-to-br from-brand-primary to-brand-secondary shadow-2xl shadow-brand-primary/20 border border-white/10 mb-6 transform hover:-rotate-6 transition-transform duration-500">
            <span className="font-black text-white italic text-4xl">Z</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent tracking-tighter italic">
            RouteZ
          </h1>
          <p className="text-brand-primary/60 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Request Operator Authorization</p>
        </div>

        {/* Signup Card */}
        <div className="bg-brand-dark border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[60px] -z-10" />
          
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic">
            <UserPlus className="w-6 h-6 text-brand-primary" />
            Initialization
          </h2>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-brand-danger/10 border border-brand-danger/20 p-4 rounded-2xl text-brand-danger text-[10px] font-black uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Operator Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Wick"
                  required
                  className="w-full bg-brand-darker border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/50 transition-all font-medium italic"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Network Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@routez.io"
                  required
                  className="w-full bg-brand-darker border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/50 transition-all font-medium italic"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Cipher</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-brand-darker border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/50 transition-all font-medium italic"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest mt-4 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Codify Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
              <span className="bg-brand-dark px-4 text-gray-600">Secure SSO Integration</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignup}
            className="w-full bg-brand-darker border border-white/5 hover:bg-white/5 text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google Intelligence</span>
          </button>

          <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-widest mt-10">
            Already authorized? <Link href="/login" className="text-brand-primary hover:underline italic ml-1">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
