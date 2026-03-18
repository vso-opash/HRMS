"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  ShoppingCart, 
  UserPlus,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';

const modules = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'My Onboarding', icon: ShieldCheck, path: '/onboarding/me' },
  { name: 'Onboarding', icon: UserPlus, path: '/onboarding' },
  { name: 'Leave', icon: Calendar, path: '/leave' },
  { name: 'Attendance', icon: Clock, path: '/attendance' },
  { name: 'Payroll', icon: CreditCard, path: '/payroll' },
  { name: 'Timesheets', icon: FileText, path: '/timesheets' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <motion.aside 
        initial={false}
        animate={{ width: isOpen ? 260 : 80 }}
        className="fixed left-0 top-0 h-screen bg-white text-slate-900 z-40 overflow-hidden flex flex-col border-r border-slate-200 shadow-xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-opash-blue rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-opash-blue/20">
            <Globe className="text-white" size={24} />
          </div>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-black text-xl tracking-tighter leading-none text-opash-blue">
                OPASH
              </span>
              <span className="text-[10px] font-bold text-opash-orange uppercase tracking-[0.2em] leading-none mt-1">
                Software
              </span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {modules.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative ${
                  isActive 
                    ? 'bg-opash-blue text-white shadow-lg shadow-opash-blue/20' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-opash-blue'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-opash-blue transition-colors'} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-semibold text-sm whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && isOpen && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-semibold text-sm"
          >
            <LogOut size={20} />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
