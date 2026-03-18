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

export interface InternalOrder {
  id?: string;
  employeeId: string;
  employeeName?: string;
  itemType: 'IT' | 'Stationery' | 'Furniture' | 'Other';
  itemName: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispatched' | 'received';
  requestedAt: any;
}

export const orderService = {
  async createOrder(data: Omit<InternalOrder, 'id' | 'requestedAt' | 'status'>) {
    const ordersRef = collection(db, 'internal_orders');
    return await addDoc(ordersRef, {
      ...data,
      status: 'pending',
      requestedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  },

  async getMyOrders(employeeId: string) {
    const ordersRef = collection(db, 'internal_orders');
    const q = query(ordersRef, where('employeeId', '==', employeeId), orderBy('requestedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalOrder));
  },

  async getAllOrders() {
    const ordersRef = collection(db, 'internal_orders');
    const q = query(ordersRef, orderBy('requestedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalOrder));
  },

  async updateOrderStatus(orderId: string, status: InternalOrder['status']) {
    const orderRef = doc(db, 'internal_orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};
