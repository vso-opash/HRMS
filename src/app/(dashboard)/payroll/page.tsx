"use client";

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function PayrollPage() {
  const { isAdmin, user } = useAuth();
  const [runs, setRuns] = useState<any[]>([]);
  const [myPayslips, setMyPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleInitiateRun = async () => {
    setProcessing(true);
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real app, this would call a cloud function or backend service
      alert('Payroll run initiated successfully for March 2026!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to initiate payroll:', error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Admin: View all payroll runs
    if (isAdmin) {
      const q = query(collection(db, 'payroll_runs'), orderBy('createdAt', 'desc'));
      const unsubRuns = onSnapshot(q, (snapshot) => {
        setRuns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubRuns();
    } else {
      // Employee: View own payslips
      const q = query(collection(db, 'employees', user.uid, 'payslips'), orderBy('generatedAt', 'desc'));
      const unsubPayslips = onSnapshot(q, (snapshot) => {
        setMyPayslips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubPayslips();
    }
  }, [isAdmin, user]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Payroll <span className="text-opash-blue">Processing</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage salary disbursements and access your digital payslips.
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Monthly Payout', value: '₹12,45,000', trend: '+4.2% from last month', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Approvals', value: '2 Runs', trend: 'Awaiting Finance Review', icon: Clock, color: 'text-opash-orange', bg: 'bg-opash-orange/5' },
              { label: 'Next Run Date', value: 'Mar 31, 2026', trend: 'Automatic processing enabled', icon: Calendar, color: 'text-opash-blue', bg: 'bg-opash-blue/5' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group"
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{stat.value}</p>
                <div className={`mt-4 flex items-center gap-2 ${stat.color} text-[10px] font-black uppercase tracking-widest`}>
                  <stat.icon size={14} />
                  {stat.trend}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-900 tracking-tight">Payroll Processing History</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-opash-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20"
              >
                Initiate New Run
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Month/Year</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Payout</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employees</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { month: 'February', year: 2026, gross: '₹12,10,000', count: 40, status: 'locked' },
                    { month: 'January', year: 2026, gross: '₹11,85,000', count: 38, status: 'locked' },
                  ].map((run, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 text-sm font-black text-slate-900">{run.month} {run.year}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-bold">{run.gross}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{run.count}</td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          <CheckCircle2 size={14} />
                          {run.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-opash-blue hover:bg-white rounded-xl transition-all shadow-sm">
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-opash-blue rounded-[3rem] p-10 text-white shadow-2xl shadow-opash-blue/20 flex items-center justify-between relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight">Your Latest Payslip</h2>
              <p className="text-opash-light/60 mt-2 font-medium">February 2026 • Net Pay: ₹85,400</p>
              <button className="mt-8 flex items-center gap-3 px-8 py-4 bg-white text-opash-blue font-black rounded-2xl hover:bg-opash-light transition-all text-xs uppercase tracking-widest shadow-xl shadow-black/10">
                <Download size={20} />
                Download PDF
              </button>
            </div>
            <div className="hidden md:block p-10 bg-white/10 rounded-[2.5rem] backdrop-blur-md border border-white/10">
              <CreditCard size={80} className="opacity-40" />
            </div>
            
            {/* Decorative element */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </motion.div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-opash-blue/10 flex items-center justify-center text-opash-blue">
                  <FileText size={20} />
                </div>
                Payslip History
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-opash-blue transition-all shadow-sm">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Payslip - {format(new Date(2026, 2-i, 1), 'MMMM yyyy')}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Generated on {format(new Date(2026, 2-i, 5), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-opash-blue hover:bg-white rounded-2xl transition-all shadow-sm" title="View">
                      <Eye size={22} />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-emerald-600 hover:bg-white rounded-2xl transition-all shadow-sm" title="Download">
                      <Download size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initiate Payroll Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Initiate Payroll</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Process salaries for the current month</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-opash-blue shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</span>
                    <span className="text-sm font-black text-slate-900">March 2026</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Employees</span>
                    <span className="text-sm font-black text-slate-900">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Payout</span>
                    <span className="text-sm font-black text-opash-blue">₹12,85,000</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                  <AlertCircle className="text-amber-600 mt-1" size={20} />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Initiating payroll will freeze attendance and timesheet logs for this period. Ensure all approvals are completed before proceeding.
                  </p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleInitiateRun}
                    disabled={processing} 
                    className="flex-1 py-5 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-opash-blue/20 text-xs uppercase tracking-widest"
                  >
                    {processing ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Confirm & Process
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
