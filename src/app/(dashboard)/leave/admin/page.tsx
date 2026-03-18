"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService, LeaveApplication } from '@/services/leaveService';
import { 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function AdminLeavePage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/leave');
      return;
    }
    loadApplications();
  }, [isAdmin]);

  const loadApplications = async () => {
    const data = await leaveService.getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      await loadApplications();
    } catch (error) {
      console.error('Failed to update leave status:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-opash-blue" size={32} />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.push('/leave')}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-opash-blue hover:border-opash-blue transition-all group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Leave <span className="text-opash-blue">Approvals</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Review and manage employee leave requests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-opash-blue/10 flex items-center justify-center text-opash-blue">
              <Calendar size={20} />
            </div>
            Pending Requests
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Days</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Employee ID</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.employeeId}</p>
                      </div>
                    </div>
                  </td>
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
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStatus(app.id!, 'approved')}
                          className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Approve"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleStatus(app.id!, 'rejected')}
                          className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
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
    </div>
  );
}
