import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp, 
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export interface AttendanceLog {
  id?: string;
  employeeId: string;
  date: string;
  punchIn: any;
  punchOut?: any;
  status: 'P' | 'A' | 'L' | 'HD' | 'LT';
  workHours?: number;
}

export const attendanceService = {
  async getTodayLog(employeeId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logRef = doc(db, 'employees', employeeId, 'attendance_logs', today);
    const snap = await getDoc(logRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AttendanceLog;
    }
    return null;
  },

  async punch(employeeId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logRef = doc(db, 'employees', employeeId, 'attendance_logs', today);
    const existing = await this.getTodayLog(employeeId);

    if (!existing) {
      // Punch In
      await setDoc(logRef, {
        employeeId,
        date: today,
        punchIn: serverTimestamp(),
        status: 'P',
        createdAt: serverTimestamp()
      });
      return 'IN';
    } else if (!existing.punchOut) {
      // Punch Out
      const punchInTime = (existing.punchIn as Timestamp).toDate();
      const punchOutTime = new Date();
      const hours = (punchOutTime.getTime() - punchInTime.getTime()) / (1000 * 60 * 60);

      await updateDoc(logRef, {
        punchOut: serverTimestamp(),
        workHours: Number(hours.toFixed(2)),
        updatedAt: serverTimestamp()
      });
      return 'OUT';
    }
    return 'DONE';
  },

  async getMonthlyLogs(employeeId: string, month: number, year: number) {
    const logsRef = collection(db, 'employees', employeeId, 'attendance_logs');
    // Simple fetch for now, can be optimized with date range queries
    const snap = await getDocs(logsRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceLog));
  }
};
