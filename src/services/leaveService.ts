import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export interface LeaveApplication {
  id?: string;
  employeeId: string;
  leaveType: 'CL' | 'SL' | 'EL' | 'LOP';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: any;
}

export const leaveService = {
  async applyLeave(data: Omit<LeaveApplication, 'id' | 'appliedAt' | 'status'>) {
    const leaveRef = collection(db, 'leave_applications');
    return await addDoc(leaveRef, {
      ...data,
      status: 'pending',
      appliedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  },

  async getMyApplications(employeeId: string) {
    const leaveRef = collection(db, 'leave_applications');
    const q = query(leaveRef, where('employeeId', '==', employeeId), orderBy('appliedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveApplication));
  },

  async getAllApplications() {
    const leaveRef = collection(db, 'leave_applications');
    const q = query(leaveRef, orderBy('appliedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveApplication));
  },

  async updateLeaveStatus(applicationId: string, status: LeaveApplication['status'], approvedBy?: string) {
    const leaveRef = doc(db, 'leave_applications', applicationId);
    await updateDoc(leaveRef, {
      status,
      approvedBy: approvedBy || null,
      updatedAt: serverTimestamp()
    });
  }
};
