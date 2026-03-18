import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface TimesheetEntry {
  projectId: string;
  projectName?: string;
  date: string;
  hours: number;
  description: string;
}

export interface Timesheet {
  id?: string;
  employeeId: string;
  weekStartDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  entries: TimesheetEntry[];
}

export const timesheetService = {
  async getTimesheet(employeeId: string, weekStartDate: string) {
    const timesheetRef = doc(db, 'employees', employeeId, 'timesheets', weekStartDate);
    const snap = await getDocs(query(collection(db, 'employees', employeeId, 'timesheets'), where('weekStartDate', '==', weekStartDate)));
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Timesheet;
    }
    return null;
  },

  async saveTimesheet(data: Timesheet) {
    const weekId = data.weekStartDate;
    const timesheetRef = doc(db, 'employees', data.employeeId, 'timesheets', weekId);
    await setDoc(timesheetRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async getMyTimesheets(employeeId: string) {
    const timesheetRef = collection(db, 'employees', employeeId, 'timesheets');
    const q = query(timesheetRef, orderBy('weekStartDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Timesheet));
  },

  async getProjects() {
    const projectsRef = collection(db, 'projects');
    const snap = await getDocs(projectsRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
