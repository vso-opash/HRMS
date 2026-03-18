"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-[260px] transition-all duration-300">
        <Header />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
