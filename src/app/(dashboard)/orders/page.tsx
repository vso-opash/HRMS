"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, InternalOrder } from '@/services/orderService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Package, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Truck,
  Box,
  Monitor,
  PenTool,
  Armchair,
  MoreHorizontal,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const orderSchema = z.object({
  itemType: z.enum(['IT', 'Stationery', 'Furniture', 'Other']),
  itemName: z.string().min(2, 'Item name is required'),
  quantity: z.number().min(1, 'Minimum quantity is 1'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function OrderPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<InternalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1 }
  });

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user, isAdmin]);

  const loadOrders = async () => {
    if (!user) return;
    const data = isAdmin ? await orderService.getAllOrders() : await orderService.getMyOrders(user.uid);
    setOrders(data);
    setLoading(false);
  };

  const onSubmit = async (data: OrderForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await orderService.createOrder({ ...data, employeeId: user.uid });
      await loadOrders();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: InternalOrder['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'IT': return <Monitor size={20} />;
      case 'Stationery': return <PenTool size={20} />;
      case 'Furniture': return <Armchair size={20} />;
      default: return <Box size={20} />;
    }
  };

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
            Internal <span className="text-opash-blue">Orders</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Request assets, stationery, and supplies for your operational needs.
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all shadow-xl shadow-opash-blue/20 text-sm uppercase tracking-widest"
          >
            <Plus size={20} />
            New Request
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'text-opash-orange', bg: 'bg-opash-orange/5' },
          { label: 'Approved', count: orders.filter(o => o.status === 'approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Dispatched', count: orders.filter(o => o.status === 'dispatched').length, color: 'text-opash-blue', bg: 'bg-opash-blue/5' },
          { label: 'Received', count: orders.filter(o => o.status === 'received').length, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="flex items-end justify-between mt-4">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.count}</p>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <Package size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-opash-blue/10 flex items-center justify-center text-opash-blue">
              <Truck size={20} />
            </div>
            {isAdmin ? 'All Requests' : 'My Requests'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Requested On</th>
                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-opash-blue transition-all shadow-sm">
                        {getItemIcon(order.itemType)}
                      </div>
                      <span className="text-sm font-black text-slate-900">{order.itemName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-bold">{order.itemType}</td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{order.quantity}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'received' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      order.status === 'dispatched' ? 'bg-opash-blue/10 text-opash-blue' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                    {order.requestedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(order.id!, 'approved')}
                              className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id!, 'rejected')}
                              className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id!, 'dispatched')}
                            className="px-4 py-2 bg-opash-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-opash-blue/90 shadow-lg shadow-opash-blue/20"
                          >
                            Dispatch
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Package size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Request</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Request supplies for your work</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-opash-blue shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
                  <select 
                    {...register('itemType')} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all appearance-none"
                  >
                    <option value="IT">IT Asset (Laptop, Monitor, etc.)</option>
                    <option value="Stationery">Stationery (Pens, Notebooks, etc.)</option>
                    <option value="Furniture">Furniture (Chair, Desk, etc.)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Item Name</label>
                  <input 
                    {...register('itemName')} 
                    placeholder="e.g. MacBook Pro 14, Wireless Mouse" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  />
                  {errors.itemName && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.itemName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Quantity</label>
                  <input 
                    {...register('quantity', { valueAsNumber: true })} 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all" 
                  />
                  {errors.quantity && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reason for Request</label>
                  <textarea 
                    {...register('reason')} 
                    rows={3} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-opash-blue/5 focus:border-opash-blue transition-all resize-none" 
                    placeholder="Why do you need this item?" 
                  />
                  {errors.reason && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.reason.message}</p>}
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 py-5 bg-opash-blue text-white font-black rounded-2xl hover:bg-opash-blue/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-opash-blue/20 text-xs uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Submit Request
                        <Plus size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
