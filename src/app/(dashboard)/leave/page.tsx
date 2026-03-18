"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService, LeaveApplication } from '@/services/leaveService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

const leaveSchema = z.object({
  leaveType: z.enum(['CL', 'SL', 'EL', 'LOP']),
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  days: z.number().min(0.5, 'Minimum 0.5 days'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

type LeaveForm = z.infer<typeof leaveSchema>;

export default function LeavePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { days: 1 }
  });

  useEffect(() => {
    if (!user) return;
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    const data = await leaveService.getMyApplications(user.uid);
    setApplications(data);
    setLoading(false);
  };

  const onSubmit = async (data: LeaveForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await leaveService.applyLeave({ ...data, employeeId: user.uid });
      await loadApplications();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to apply leave:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
            Leave <span className="text-opash-blue">Management</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Balance your work and life. Apply for leave and track your requests.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => router.push('/leave/admin')}
              className="flex items-center gap-2 px-8 py-4 bg-opash-dark text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-opash-dark/20 text-sm uppercase tracking-widest"
            >
              <CheckCircle2 size={20} />
              Manage Requests
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20 text-sm uppercase tracking-widest"
          >
            <Plus size={20} />
            Apply Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Casual Leave', code: 'CL', balance: 8, color: 'text-opash-blue', bg: 'bg-opash-blue/5' },
          { name: 'Sick Leave', code: 'SL', balance: 5, color: 'text-opash-orange', bg: 'bg-opash-orange/5' },
          { name: 'Earned Leave', code: 'EL', balance: 12, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { name: 'LOP', code: 'LOP', balance: '-', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((type, i) => (
          <motion.div 
            key={type.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{type.name}</p>
            <div className="flex items-end justify-between mt-4">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{type.balance}</p>
              <div className={`${type.bg} ${type.color} px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest`}>
                {type.code}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-opash-blue/10 flex items-center justify-center text-opash-blue">
              <FileText size={20} />
            </div>
            Leave History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Days</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">{app.leaveType}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {app.fromDate} <span className="text-slate-300 mx-2">→</span> {app.toDate}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{app.days}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {app.status === 'approved' ? <CheckCircle2 size={14} /> : 
                       app.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                    {app.appliedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <FileText size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leave applications found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
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
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apply for Leave</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Submit your request for approval</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-opash-blue shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Leave Type</label>
                  <select 
                    {...register('leaveType')} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all appearance-none"
                  >
                    <option value="CL">Casual Leave (CL)</option>
                    <option value="SL">Sick Leave (SL)</option>
                    <option value="EL">Earned Leave (EL)</option>
                    <option value="LOP">Loss of Pay (LOP)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">From Date</label>
                    <input 
                      {...register('fromDate')} 
                      type="date" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    />
                    {errors.fromDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.fromDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">To Date</label>
                    <input 
                      {...register('toDate')} 
                      type="date" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    />
                    {errors.toDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.toDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Total Days</label>
                  <input 
                    {...register('days', { valueAsNumber: true })} 
                    type="number" 
                    step="0.5" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  />
                  {errors.days && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.days.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reason</label>
                  <textarea 
                    {...register('reason')} 
                    rows={3} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all resize-none" 
                    placeholder="Briefly explain your reason for leave..." 
                  />
                  {errors.reason && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.reason.message}</p>}
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 py-5 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-opash-blue/20 text-xs uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Submit Application
                        <Plus size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
