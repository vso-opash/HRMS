"use client";

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { UserPlus, Search, Filter, ChevronRight, CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';
import CreateEmployeeModal from '@/components/modules/onboarding/CreateEmployeeModal';
import { motion } from 'motion/react';

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'employees'), where('status', 'in', ['pending', 'active']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      (emp.deptId && emp.deptId.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-opash-blue" size={32} />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Employee <span className="text-opash-blue">Onboarding</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Streamline the journey for new talent joining Opash Software.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20 text-sm uppercase tracking-widest"
        >
          <UserPlus size={20} />
          Add New Joiner
        </button>
      </div>

      <CreateEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, email or department..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-4 text-[10px] font-black text-slate-400 hover:text-opash-blue hover:bg-white rounded-xl transition-all uppercase tracking-widest shadow-sm">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Join Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp, i) => (
                <motion.tr 
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-opash-blue/10 flex items-center justify-center text-opash-blue font-black text-sm group-hover:bg-opash-blue group-hover:text-white transition-all shadow-sm">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-400 font-medium">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-bold">{emp.deptId || 'Unassigned'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg">{emp.joinDate || 'TBD'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      emp.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {emp.status === 'active' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">65% Complete</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-opash-blue rounded-full shadow-sm" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/onboarding/${emp.id}`}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-opash-blue hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <UserPlus size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No new joiners found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
