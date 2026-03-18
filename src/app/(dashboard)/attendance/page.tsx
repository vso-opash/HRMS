"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceService, AttendanceLog } from '@/services/attendanceService';
import { format } from 'date-fns';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [today, history] = await Promise.all([
      attendanceService.getTodayLog(user.uid),
      attendanceService.getMonthlyLogs(user.uid, new Date().getMonth(), new Date().getFullYear())
    ]);
    setTodayLog(today);
    setLogs(history);
    setLoading(false);
  };

  const handlePunch = async () => {
    if (!user) return;
    setPunching(true);
    try {
      await attendanceService.punch(user.uid);
      await loadData();
    } catch (error) {
      console.error('Punch failed:', error);
    } finally {
      setPunching(false);
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
            Attendance <span className="text-opash-blue">Tracking</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Log your daily shift and monitor your working hours in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Punch Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-all ${
              todayLog?.punchOut ? 'bg-slate-100 text-slate-300' : 
              todayLog?.punchIn ? 'bg-opash-orange/10 text-opash-orange animate-pulse' : 
              'bg-opash-blue/10 text-opash-blue'
            }`}>
              <Clock size={48} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {todayLog?.punchOut ? 'Shift Completed' : todayLog?.punchIn ? 'Currently Working' : 'Ready to Start?'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-2 mb-10">
              {todayLog?.punchIn ? `Punched in at ${format(todayLog.punchIn.toDate(), 'hh:mm a')}` : 'Please punch in to start your shift.'}
            </p>

            <button
              onClick={handlePunch}
              disabled={punching || !!todayLog?.punchOut}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
                todayLog?.punchOut 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                  : todayLog?.punchIn 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-opash-blue text-white hover:bg-opash-blue/90 shadow-opash-blue/20'
              }`}
            >
              {punching ? <Loader2 className="animate-spin" size={20} /> : 
               todayLog?.punchOut ? <CheckCircle2 size={20} /> :
               todayLog?.punchIn ? <LogOut size={20} /> : <LogIn size={20} />}
              {todayLog?.punchOut ? 'Shift Ended' : todayLog?.punchIn ? 'Punch Out' : 'Punch In'}
            </button>

            {todayLog?.workHours && (
              <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] w-full border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Hours Today</p>
                <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{todayLog.workHours} <span className="text-sm text-slate-400">HRS</span></p>
              </div>
            )}
          </motion.div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-opash-blue/10 flex items-center justify-center text-opash-blue">
                  <CalendarIcon size={20} />
                </div>
                Recent Logs
              </h3>
              <button className="text-[10px] font-black text-opash-blue hover:text-opash-orange transition-colors uppercase tracking-widest flex items-center gap-2">
                View Full Calendar
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Punch In</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Punch Out</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hours</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 text-sm font-black text-slate-900">{log.date}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{log.punchIn ? format(log.punchIn.toDate(), 'hh:mm a') : '-'}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{log.punchOut ? format(log.punchOut.toDate(), 'hh:mm a') : '-'}</td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">
                        {log.workHours ? (
                          <span className="bg-slate-100 px-3 py-1 rounded-lg">{log.workHours}</span>
                        ) : '-'}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          log.status === 'P' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {log.status === 'P' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <CalendarIcon size={32} />
                          </div>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No attendance logs found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
