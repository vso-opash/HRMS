import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { logAudit, AuditModule, AuditAction } from './auditService';

export interface OnboardingTask {
  id?: string;
  title: string;
  ownerRole: 'employee' | 'hr' | 'it' | 'finance' | 'manager';
  isMandatory: boolean;
  status: 'pending' | 'in_progress' | 'done';
  fileUrl?: string;
  completedAt?: any;
}

export const onboardingService = {
  async getTasks(employeeId: string) {
    const tasksRef = collection(db, 'employees', employeeId, 'onboarding_tasks');
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OnboardingTask));
  },

  async updateTaskStatus(employeeId: string, taskId: string, status: OnboardingTask['status'], fileUrl?: string) {
    const taskRef = doc(db, 'employees', employeeId, 'onboarding_tasks', taskId);
    const updateData: any = { status, updatedAt: serverTimestamp() };
    if (status === 'done') {
      updateData.completedAt = serverTimestamp();
    }
    if (fileUrl) {
      updateData.fileUrl = fileUrl;
    }

    await updateDoc(taskRef, updateData);
    await logAudit(AuditModule.ONBOARDING, AuditAction.UPDATE, taskId, { status: 'previous' }, { status });
  },

  async initializeChecklist(employeeId: string) {
    const defaultTasks: Omit<OnboardingTask, 'id'>[] = [
      { title: 'Sign Offer Letter', ownerRole: 'employee', isMandatory: true, status: 'pending' },
      { title: 'Upload ID Proof', ownerRole: 'employee', isMandatory: true, status: 'pending' },
      { title: 'Bank Details Submission', ownerRole: 'employee', isMandatory: true, status: 'pending' },
      { title: 'IT Asset Allocation', ownerRole: 'it', isMandatory: true, status: 'pending' },
      { title: 'Finance Verification', ownerRole: 'finance', isMandatory: true, status: 'pending' },
      { title: 'HR Induction', ownerRole: 'hr', isMandatory: false, status: 'pending' },
    ];

    const batch = writeBatch(db);
    const tasksRef = collection(db, 'employees', employeeId, 'onboarding_tasks');

    defaultTasks.forEach(task => {
      const newDocRef = doc(tasksRef);
      batch.set(newDocRef, { ...task, createdAt: serverTimestamp() });
    });

    await batch.commit();
  },

  async updateEmployeeInfo(employeeId: string, info: any) {
    const empRef = doc(db, 'employees', employeeId);
    await updateDoc(empRef, {
      ...info,
      updatedAt: serverTimestamp()
    });
  }
};
