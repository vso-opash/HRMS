"use client";

import React, { useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: 'Total Workforce', value: '0', icon: Users, color: 'text-opash-blue', bg: 'bg-opash-blue/5', trend: '...' },
    { name: 'Active Projects', value: '0', icon: Briefcase, color: 'text-opash-orange', bg: 'bg-opash-orange/5', trend: '...' },
    { name: 'Attendance Rate', value: '0%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '...' },
    { name: 'Open Roles', value: '0', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '...' },
  ]);
  const [recentOnboarding, setRecentOnboarding] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch Total Workforce
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const count = snapshot.size;
      setStats(prev => prev.map(s => s.name === 'Total Workforce' ? { ...s, value: count.toString() } : s));
      
      // Recent Onboarding
      const recent = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(emp => emp.status === 'pending')
        .slice(0, 3);
      setRecentOnboarding(recent);
    }, (error) => {
      console.error('Error fetching employees:', error);
    });

    // Fetch Pending Actions (Leave & Orders)
    const unsubLeave = onSnapshot(query(collection(db, 'leave_applications'), where('status', '==', 'pending')), (snapshot) => {
      const leaveActions = snapshot.docs.map(doc => ({
        id: doc.id,
        title: 'Leave Approval',
        sub: `${doc.data().leaveType} - ${doc.data().days} Days`,
        icon: Calendar,
        color: 'text-amber-400'
      }));
      
      const unsubOrders = onSnapshot(query(collection(db, 'internal_orders'), where('status', '==', 'pending')), (snapshotOrders) => {
        const orderActions = snapshotOrders.docs.map(doc => ({
          id: doc.id,
          title: 'Asset Request',
          sub: doc.data().itemName,
          icon: Briefcase,
          color: 'text-opash-blue'
        }));
        setPendingActions([...leaveActions, ...orderActions].slice(0, 5));
      }, (error) => {
        console.error('Error fetching orders:', error);
      });

      return () => unsubOrders();
    }, (error) => {
      console.error('Error fetching leave applications:', error);
    });

    return () => {
      unsubEmployees();
      unsubLeave();
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Workforce <span className="text-opash-blue">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Real-time insights into Opash Software's human capital and operational efficiency.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-bold text-slate-600">
          <Calendar className="text-opash-blue" size={18} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-opash-blue/5 transition-all group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                <ArrowUpRight size={12} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{stat.name}</p>
              <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Onboarding</h2>
              <p className="text-sm text-slate-400 font-medium">New talent joining the Opash family</p>
            </div>
            <button className="px-6 py-2.5 bg-slate-50 text-opash-blue text-xs font-bold rounded-xl hover:bg-opash-blue hover:text-white transition-all">
              View Pipeline
            </button>
          </div>
          <div className="space-y-4">
            {recentOnboarding.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                <div className="w-12 h-12 rounded-2xl bg-opash-blue/10 text-opash-blue flex items-center justify-center text-sm font-black group-hover:bg-opash-blue group-hover:text-white transition-all">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-slate-500 font-medium">{emp.role} • Joined {emp.joinDate}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 size={12} />
                  Verified
                </div>
              </div>
            ))}
            {recentOnboarding.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No recent onboarding</p>
            )}
          </div>
        </div>

        <div className="bg-opash-dark p-8 rounded-[2.5rem] text-white shadow-2xl shadow-opash-dark/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-black tracking-tight mb-2">Pending Actions</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Items requiring your immediate attention</p>
            
            <div className="space-y-4">
              {pendingActions.map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} bg-white/5 p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
              {pendingActions.length === 0 && (
                <p className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">All caught up!</p>
              )}
            </div>

            <button className="w-full mt-8 py-4 bg-opash-orange text-white font-black rounded-2xl hover:bg-opash-orange/90 transition-all shadow-lg shadow-opash-orange/20 text-sm uppercase tracking-widest">
              Review All Tasks
            </button>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-opash-blue/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
