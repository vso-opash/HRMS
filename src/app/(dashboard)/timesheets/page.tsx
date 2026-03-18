"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timesheetService, Timesheet, TimesheetEntry } from '@/services/timesheetService';
import { format, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import { 
  Clock, 
  Plus, 
  Save, 
  Send, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function TimesheetPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, currentWeek]);

  const loadData = async () => {
    setLoading(true);
    const [projs, ts] = await Promise.all([
      timesheetService.getProjects(),
      timesheetService.getTimesheet(user!.uid, format(currentWeek, 'yyyy-MM-dd'))
    ]);
    setProjects(projs);
    setTimesheet(ts || {
      employeeId: user!.uid,
      weekStartDate: format(currentWeek, 'yyyy-MM-dd'),
      status: 'draft',
      totalHours: 0,
      entries: []
    });
    setLoading(false);
  };

  const handleAddEntry = () => {
    if (!timesheet) return;
    const newEntry: TimesheetEntry = {
      projectId: projects[0]?.id || '',
      date: format(currentWeek, 'yyyy-MM-dd'),
      hours: 0,
      description: ''
    };
    setTimesheet({
      ...timesheet,
      entries: [...timesheet.entries, newEntry]
    });
  };

  const handleEntryChange = (index: number, field: keyof TimesheetEntry, value: any) => {
    if (!timesheet) return;
    const newEntries = [...timesheet.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    const total = newEntries.reduce((acc, curr) => acc + Number(curr.hours || 0), 0);
    setTimesheet({ ...timesheet, entries: newEntries, totalHours: total });
  };

  const handleSave = async (status: Timesheet['status'] = 'draft') => {
    if (!timesheet || !user) return;
    setSaving(true);
    try {
      await timesheetService.saveTimesheet({ ...timesheet, status });
      await loadData();
    } catch (error) {
      console.error('Failed to save timesheet:', error);
    } finally {
      setSaving(false);
    }
  };

  const weekDays = eachDayOfInterval({
    start: currentWeek,
    end: addDays(currentWeek, 6)
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
            Time <span className="text-opash-blue">Tracking</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Log your weekly work hours against projects and submit for approval.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              className="p-3 hover:bg-slate-50 text-slate-400 hover:text-opash-blue transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-6 py-3 text-xs font-black text-slate-900 border-x border-slate-50 uppercase tracking-widest">
              Week of {format(currentWeek, 'MMM dd, yyyy')}
            </div>
            <button 
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              className="p-3 hover:bg-slate-50 text-slate-400 hover:text-opash-blue transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => handleSave('submitted')}
            disabled={saving || timesheet?.status !== 'draft'}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl shadow-emerald-600/20 text-xs uppercase tracking-widest"
          >
            <Send size={18} />
            Submit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-6">
            <h3 className="font-black text-slate-900 tracking-tight">Weekly Log</h3>
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              timesheet?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
              timesheet?.status === 'submitted' ? 'bg-opash-blue/10 text-opash-blue' :
              'bg-amber-50 text-amber-600'
            }`}>
              {timesheet?.status}
            </span>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Total Hours: <span className="text-slate-900 text-xl tracking-tight ml-2">{timesheet?.totalHours || 0}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {timesheet?.entries.map((entry, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group"
            >
              <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project</label>
                <select 
                  value={entry.projectId}
                  onChange={(e) => handleEntryChange(idx, 'projectId', e.target.value)}
                  disabled={timesheet.status !== 'draft'}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all appearance-none"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  {projects.length === 0 && <option value="">No Projects</option>}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                <select 
                  value={entry.date}
                  onChange={(e) => handleEntryChange(idx, 'date', e.target.value)}
                  disabled={timesheet.status !== 'draft'}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all appearance-none"
                >
                  {weekDays.map(day => (
                    <option key={format(day, 'yyyy-MM-dd')} value={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'EEE, MMM dd')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hours</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={entry.hours}
                  onChange={(e) => handleEntryChange(idx, 'hours', e.target.value)}
                  disabled={timesheet.status !== 'draft'}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all"
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                <input 
                  type="text" 
                  value={entry.description}
                  onChange={(e) => handleEntryChange(idx, 'description', e.target.value)}
                  disabled={timesheet.status !== 'draft'}
                  placeholder="What did you work on?"
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all"
                />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button 
                  onClick={() => {
                    const newEntries = timesheet.entries.filter((_, i) => i !== idx);
                    setTimesheet({ ...timesheet, entries: newEntries });
                  }}
                  disabled={timesheet.status !== 'draft'}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-30"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}

          {timesheet?.status === 'draft' && (
            <button 
              onClick={handleAddEntry}
              className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-black flex items-center justify-center gap-3 hover:border-opash-blue/30 hover:text-opash-blue hover:bg-opash-blue/5 transition-all text-xs uppercase tracking-[0.2em]"
            >
              <Plus size={24} />
              Add New Entry
            </button>
          )}

          {timesheet?.entries.length === 0 && (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Clock size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries for this week yet</p>
              </div>
            </div>
          )}
        </div>

        {timesheet?.status === 'draft' && (
          <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex justify-end">
            <button 
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-3 px-10 py-4 bg-opash-dark text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-opash-dark/20 text-xs uppercase tracking-widest"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
              Save Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
