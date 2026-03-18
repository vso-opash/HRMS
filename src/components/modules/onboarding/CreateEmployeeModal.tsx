import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { onboardingService } from '@/services/onboardingService';
import { logAudit, AuditModule, AuditAction } from '@/services/auditService';
import { X, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().min(2, 'Role is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  employmentType: z.enum(['full_time', 'part_time', 'intern', 'contract']),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

export default function CreateEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { employmentType: 'full_time' }
  });

  const onSubmit = async (data: EmployeeForm) => {
    setLoading(true);
    try {
      // 1. Create Employee Record
      const empRef = await addDoc(collection(db, 'employees'), {
        ...data,
        empId: `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Initialize Onboarding Checklist
      await onboardingService.initializeChecklist(empRef.id);

      // 3. Log Audit
      await logAudit(AuditModule.EMPLOYEES, AuditAction.CREATE, empRef.id, null, data);

      reset();
      onClose();
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-opash-dark/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-opash-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-opash-blue/20">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Joiner</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Employee Onboarding</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-slate-300 hover:text-opash-blue shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    {...register('firstName')} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    placeholder="e.g. John"
                  />
                  {errors.firstName && <p className="text-opash-orange text-[10px] font-bold mt-1 ml-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    {...register('lastName')} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    placeholder="e.g. Doe"
                  />
                  {errors.lastName && <p className="text-opash-orange text-[10px] font-bold mt-1 ml-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  {...register('email')} 
                  type="email" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  placeholder="john.doe@opashsoftware.com"
                />
                {errors.email && <p className="text-opash-orange text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                  <input 
                    {...register('role')} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                    placeholder="e.g. Software Engineer"
                  />
                  {errors.role && <p className="text-opash-orange text-[10px] font-bold mt-1 ml-1">{errors.role.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                  <input 
                    {...register('joinDate')} 
                    type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  />
                  {errors.joinDate && <p className="text-opash-orange text-[10px] font-bold mt-1 ml-1">{errors.joinDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                <select 
                  {...register('employmentType')} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all appearance-none"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="intern">Intern</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-4 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white hover:text-opash-blue transition-all border border-transparent hover:border-slate-100 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 py-4 bg-opash-blue text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-opash-blue/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-opash-blue/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <UserPlus size={18} />
                      Create Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
