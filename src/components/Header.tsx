"use client";

import React from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { profile, user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-opash-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-opash-blue hover:bg-opash-blue/5 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-opash-orange rounded-full ring-2 ring-white" />
        </button>
        
        <button className="p-2 text-slate-400 hover:text-opash-blue hover:bg-opash-blue/5 rounded-xl transition-all">
          <Settings size={20} />
        </button>

        <div className="h-8 w-[1px] bg-slate-100" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-opash-blue transition-colors">
              {profile?.firstName || user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {profile?.role || 'User'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-opash-blue group-hover:shadow-lg group-hover:shadow-opash-blue/10 transition-all">
            <User size={22} className="text-slate-400 group-hover:text-opash-blue transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
