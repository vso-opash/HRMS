"use client";

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingService, OnboardingTask } from '@/services/onboardingService';
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  User,
  CreditCard,
  Phone,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function MyOnboardingPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'employees', user.uid, 'onboarding_tasks'),
      where('ownerRole', '==', 'employee')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OnboardingTask));
      setTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
  });

  const handleSaveInfo = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update employee record with additional info
      await onboardingService.updateEmployeeInfo(user.uid, formData);
      alert('Information saved successfully!');
    } catch (error) {
      console.error('Failed to save info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;
    await onboardingService.updateTaskStatus(user.uid, taskId, 'done');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1 of 4</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  placeholder="Full residential address"
                />
              </div>
            </div>
            <div className="pt-6">
              <button 
                onClick={handleSaveInfo}
                className="px-10 py-4 bg-opash-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20"
              >
                Save & Continue
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bank Details</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 2 of 4</span>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                <input 
                  type="text" 
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  placeholder="HDFC Bank, ICICI, etc."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                  <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    placeholder="0000 0000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                  <input 
                    type="text" 
                    value={formData.ifsc}
                    onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    placeholder="HDFC0001234"
                  />
                </div>
              </div>
            </div>
            <div className="pt-6">
              <button 
                onClick={handleSaveInfo}
                className="px-10 py-4 bg-opash-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20"
              >
                Save & Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Document Upload</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 3 of 4</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Aadhar Card', 'PAN Card', 'Degree Certificate', 'Relieving Letter'].map((doc) => (
                <div key={doc} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center text-center space-y-4 hover:bg-white hover:border-opash-blue/30 transition-all group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-opash-blue shadow-sm transition-all">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{doc}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF or Image (Max 5MB)</p>
                  </div>
                  <button className="w-full py-3 bg-white text-opash-blue text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 hover:bg-opash-blue hover:text-white transition-all">
                    Choose File
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Checklist</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Tasks</span>
            </div>
            
            <div className="space-y-4">
              {tasks.map((task, i) => (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${
                    task.status === 'done' 
                      ? 'bg-emerald-50/30 border-emerald-100 opacity-75' 
                      : 'bg-slate-50 border-slate-100 hover:border-opash-blue/30 hover:bg-white hover:shadow-xl hover:shadow-opash-blue/5'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    task.status === 'done' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-200 shadow-sm'
                  }`}>
                    <CheckCircle2 size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`text-sm font-black tracking-tight ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {task.isMandatory ? 'Required' : 'Optional'}
                    </p>
                  </div>

                  {task.status !== 'done' && (
                    <button 
                      onClick={() => handleCompleteTask(task.id!)}
                      className="px-6 py-3 bg-opash-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-opash-dark/10"
                    >
                      Complete
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-opash-blue" size={32} />
    </div>
  );

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((completedCount / tasks.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-opash-dark rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-opash-dark/20"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-opash-blue rounded-2xl flex items-center justify-center shadow-lg shadow-opash-blue/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Welcome to the Team!</h1>
              <p className="text-opash-orange text-[10px] font-black uppercase tracking-[0.3em] mt-1">Opash Software Talent Hub</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
            We're excited to have you on board. Please complete your onboarding checklist to get started with your journey at Opash Software.
          </p>
          
          <div className="mt-12 flex flex-col md:flex-row md:items-end gap-10">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarding Progress</span>
                <span className="text-sm font-black text-opash-orange">{progress}%</span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-opash-blue rounded-full shadow-lg shadow-opash-blue/20" 
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black tracking-tighter">{completedCount}<span className="text-xl text-slate-500 ml-1">/{tasks.length}</span></p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Tasks Completed</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-opash-blue/10 blur-3xl -mr-40 -mt-40 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-opash-orange/10 blur-3xl -ml-32 -mb-32 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Steps */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 1, name: 'Personal Info', icon: User },
            { id: 2, name: 'Bank Details', icon: CreditCard },
            { id: 3, name: 'Documents', icon: FileText },
            { id: 4, name: 'Checklist', icon: CheckCircle2 },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left group border ${
                step === s.id 
                  ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 border-slate-100' 
                  : 'text-slate-400 hover:text-opash-blue hover:bg-white/80 border-transparent'
              }`}
            >
              <div className={`p-3 rounded-xl transition-all ${
                step === s.id ? 'bg-opash-blue text-white shadow-lg shadow-opash-blue/20' : 'bg-slate-50 text-slate-300 group-hover:bg-opash-blue/10 group-hover:text-opash-blue'
              }`}>
                <s.icon size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 min-h-[500px]"
          >
            {step === 4 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Checklist</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Tasks</span>
                </div>
                
                <div className="space-y-4">
                  {tasks.map((task, i) => (
                    <motion.div 
                      key={task.id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${
                        task.status === 'done' 
                          ? 'bg-emerald-50/30 border-emerald-100 opacity-75' 
                          : 'bg-slate-50 border-slate-100 hover:border-opash-blue/30 hover:bg-white hover:shadow-xl hover:shadow-opash-blue/5'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        task.status === 'done' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-200 shadow-sm'
                      }`}>
                        <CheckCircle2 size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`text-sm font-black tracking-tight ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {task.isMandatory ? 'Required' : 'Optional'}
                        </p>
                      </div>

                      {task.status !== 'done' && (
                        <button 
                          onClick={() => handleCompleteTask(task.id!)}
                          className="px-6 py-3 bg-opash-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-opash-dark/10"
                        >
                          Complete
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 shadow-inner">
                  <AlertCircle size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Step {step} Content</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2">
                    This section is being implemented as part of the onboarding data collection sprint.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-3 text-opash-blue font-black text-xs uppercase tracking-widest hover:gap-5 transition-all group"
                >
                  Continue to next step
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
