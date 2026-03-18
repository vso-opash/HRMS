import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum AuditModule {
  EMPLOYEES = 'employees',
  ONBOARDING = 'onboarding',
  LEAVE = 'leave',
  ATTENDANCE = 'attendance',
  PAYROLL = 'payroll',
  ACCESS = 'access',
  TIMESHEETS = 'timesheets',
  ORDERS = 'orders',
  RECRUITMENT = 'recruitment'
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export async function logAudit(
  module: AuditModule,
  action: AuditAction,
  recordId: string | null = null,
  beforeData: any = null,
  afterData: any = null
) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      employeeId: auth.currentUser?.uid || 'system',
      module,
      action,
      recordId,
      beforeData,
      afterData,
      ipAddress: 'client-side', // In a real app, we'd get this from the server
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
