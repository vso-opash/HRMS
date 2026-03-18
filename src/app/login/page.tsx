"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    
    let email = data.email;
    if (email === 'admin') {
      email = 'admin@opash.com';
    }

    try {
      try {
        await signInWithEmailAndPassword(auth, email, data.password);
      } catch (signInErr: any) {
        // Handle operation-not-allowed by falling back to mock session for admin
        if (signInErr.code === 'auth/operation-not-allowed' || signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          if (email === 'admin@opash.com' && data.password === '123456') {
            // Mock session bypass
            const mockUser = {
              user: {
                uid: 'mock-admin-uid',
                email: 'admin@opash.com',
                emailVerified: true,
              },
              profile: {
                empId: 'EMP-ADMIN-001',
                firstName: 'System',
                lastName: 'Admin',
                email: 'admin@opash.com',
                role: 'super_admin',
                status: 'active'
              }
            };
            localStorage.setItem('mock_user', JSON.stringify(mockUser));
            window.location.href = '/'; // Full reload to trigger AuthContext check
            return;
          }
          
          if (signInErr.code === 'auth/operation-not-allowed') {
            setError('Email/Password login is not enabled in Firebase Console. Please enable it or use the admin bypass.');
            return;
          }
          
          throw signInErr;
        } else {
          throw signInErr;
        }
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-opash-blue/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-opash-orange/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-opash-blue rounded-[2rem] flex items-center justify-center shadow-2xl shadow-opash-blue/20 mb-4">
            <Globe className="text-white" size={32} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              OPASH <span className="text-opash-blue">HRMS</span>
            </h1>
            <p className="text-[10px] font-black text-opash-orange uppercase tracking-[0.3em] mt-2">
              Empowering Innovation
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Access your employee portal securely.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3"
              >
                <ShieldCheck size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Username</label>
              <input
                {...register('email')}
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue focus:bg-white transition-all"
                placeholder="e.g. admin or name@opashsoftware.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-opash-blue hover:text-opash-orange transition-colors uppercase tracking-widest">Forgot?</Link>
              </div>
              <input
                {...register('password')}
                type="password"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue focus:bg-white transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-opash-blue/20 text-sm uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; 2026 Opash Software. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" title="Privacy Policy" className="text-[10px] font-black text-slate-300 hover:text-opash-blue transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="#" title="Terms of Service" className="text-[10px] font-black text-slate-300 hover:text-opash-blue transition-colors uppercase tracking-widest">Terms</Link>
            <Link href="#" title="Support" className="text-[10px] font-black text-slate-300 hover:text-opash-blue transition-colors uppercase tracking-widest">Support</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
