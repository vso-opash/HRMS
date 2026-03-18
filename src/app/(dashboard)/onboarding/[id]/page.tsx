"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { onboardingService, OnboardingTask } from '@/services/onboardingService';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  Briefcase, 
  Calendar,
  ExternalLink,
  Shield,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function OnboardingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const empUnsub = onSnapshot(doc(db, 'employees', id), (doc) => {
      if (doc.exists()) {
        setEmployee({ id: doc.id, ...doc.data() });
      } else {
        router.push('/onboarding');
      }
    });

    const tasksUnsub = onSnapshot(collection(db, 'employees', id, 'onboarding_tasks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OnboardingTask));
      setTasks(data);
      setLoading(false);
    });

    return () => {
      empUnsub();
      tasksUnsub();
    };
  }, [id, router]);

  const handleTaskStatus = async (taskId: string, status: OnboardingTask['status']) => {
    if (!id) return;
    await onboardingService.updateTaskStatus(id, taskId, status);
  };

  if (loading || !employee) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-opash-blue" size={32} />
    </div>
  );

  const progress = Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) || 0;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.push('/onboarding')}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-opash-blue hover:border-opash-blue transition-all group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Onboarding <span className="text-opash-blue">Detail</span></h1>
          <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            <span>Employees</span>
            <span className="text-slate-200">/</span>
            <span className="text-opash-orange">{employee.firstName} {employee.lastName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Profile & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-opash-blue/10 flex items-center justify-center text-4xl font-black text-opash-blue border-4 border-white shadow-xl mb-6">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{employee.firstName} {employee.lastName}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{employee.role}</p>
              
              <div className="mt-10 w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</span>
                  <span className="font-mono font-black text-opash-blue">{employee.empId}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    employee.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</span>
                  <span className="text-sm font-black text-slate-900">{employee.joinDate}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-opash-dark p-10 rounded-[3rem] text-white shadow-2xl shadow-opash-dark/20"
          >
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Shield size={18} className="text-opash-orange" />
              Onboarding Progress
            </h3>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-black tracking-tighter">{progress}<span className="text-xl text-opash-orange ml-1">%</span></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {tasks.filter(t => t.status === 'done').length} / {tasks.length} tasks
                </span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-opash-orange rounded-full shadow-lg shadow-opash-orange/20" 
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Checklist */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h3 className="font-black text-slate-900 tracking-tight">Onboarding Checklist</h3>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  {tasks.length} Total Tasks
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-50">
              {tasks.map((task, i) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 flex items-start gap-6 hover:bg-slate-50/50 transition-all group"
                >
                  <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    task.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-opash-blue shadow-sm'
                  }`}>
                    {task.status === 'done' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-black tracking-tight ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {task.ownerRole}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {task.isMandatory ? 'Mandatory Task' : 'Optional Task'}
                    </p>
                    
                    {task.fileUrl && (
                      <a 
                        href={task.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-3 text-[10px] font-black text-opash-blue hover:text-opash-orange bg-opash-blue/5 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
                      >
                        <FileText size={14} />
                        View Attachment
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {task.status !== 'done' ? (
                      <button 
                        onClick={() => handleTaskStatus(task.id!, 'done')}
                        className="px-6 py-3 bg-opash-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-opash-dark/10"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleTaskStatus(task.id!, 'pending')}
                        className="px-6 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-opash-blue transition-all shadow-sm"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
