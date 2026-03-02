import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGetAllOrders, useUpdateOrderStatus } from '../hooks/useQueries';
import { ServiceOrder } from '../backend';

interface AdminDashboardProps {
  onNavigateQR?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Form Submitted': return 'bg-blue-100 text-blue-800';
    case 'Under Review': return 'bg-yellow-100 text-yellow-800';
    case 'Accepted': return 'bg-green-100 text-green-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    case 'Payment Pending': return 'bg-orange-100 text-orange-800';
    case 'Payment Confirmed': return 'bg-purple-100 text-purple-800';
    case 'Completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function openAttachment(dataBase64: string, defaultMime = 'image/jpeg') {
  if (!dataBase64) return;
  let dataUrl = dataBase64;
  if (!dataBase64.startsWith('data:')) {
    dataUrl = `data:${defaultMime};base64,${dataBase64}`;
  }
  const win = window.open();
  if (win) {
    win.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;" />`);
    win.document.title = 'Attachment';
  }
}

interface OrderCardProps {
  order: ServiceOrder;
}

function OrderCard({ order }: OrderCardProps) {
  const updateStatus = useUpdateOrderStatus();
  const [cardMessage, setCardMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStatusUpdate = async (newStatus: string) => {
    setCardMessage(null);
    try {
      await updateStatus.mutateAsync({ orderId: order.orderId, status: newStatus });
      setCardMessage({ type: 'success', text: `Order ${newStatus} successfully!` });
      setTimeout(() => setCardMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Don't show re-login messages; show a friendly error instead
      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('admin')) {
        setCardMessage({ type: 'error', text: 'Action failed. Please refresh and try again.' });
      } else {
        setCardMessage({ type: 'error', text: 'Failed to update status. Please try again.' });
      }
      setTimeout(() => setCardMessage(null), 4000);
    }
  };

  const isPending = updateStatus.isPending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-bold text-gray-800 text-sm">Order #{order.orderId.toString()}</span>
          <span className="ml-2 text-xs text-gray-500">{order.serviceName}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-1">
        <span className="font-medium">{order.name}</span> · {order.mobile}
      </div>
      <div className="text-xs text-gray-500 mb-2 truncate">{order.address}</div>
      {order.amount > 0 && (
        <div className="text-sm font-semibold text-green-700 mb-2">₹{order.amount.toString()}</div>
      )}

      {cardMessage && (
        <div className={`text-xs px-3 py-2 rounded-lg mb-2 font-medium ${
          cardMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {cardMessage.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {order.status === 'Form Submitted' || order.status === 'Under Review' ? (
          <>
            <button
              onClick={() => handleStatusUpdate('Accepted')}
              disabled={isPending}
              className="flex-1 min-w-[80px] bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              {isPending ? '...' : '✓ Accept'}
            </button>
            <button
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={isPending}
              className="flex-1 min-w-[80px] bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              {isPending ? '...' : '✗ Reject'}
            </button>
          </>
        ) : null}

        {order.status === 'Accepted' && (
          <button
            onClick={() => handleStatusUpdate('Payment Pending')}
            disabled={isPending}
            className="flex-1 min-w-[100px] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            {isPending ? '...' : 'Set Payment Pending'}
          </button>
        )}

        {order.status === 'Payment Pending' && (
          <button
            onClick={() => handleStatusUpdate('Payment Confirmed')}
            disabled={isPending}
            className="flex-1 min-w-[100px] bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            {isPending ? '...' : 'Confirm Payment'}
          </button>
        )}

        {order.status === 'Payment Confirmed' && (
          <button
            onClick={() => handleStatusUpdate('Completed')}
            disabled={isPending}
            className="flex-1 min-w-[80px] bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            {isPending ? '...' : 'Mark Complete'}
          </button>
        )}

        {order.photoDataBase64 && (
          <button
            onClick={() => openAttachment(order.photoDataBase64, 'image/jpeg')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors border border-blue-200"
          >
            📷 Photo
          </button>
        )}

        {order.documentDataBase64 && (
          <button
            onClick={() => openAttachment(order.documentDataBase64, 'application/pdf')}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors border border-indigo-200"
          >
            📄 Document
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onNavigateQR }: AdminDashboardProps) {
  const { isAdminLoggedIn } = useAuth();
  const { data: orders = [], isLoading, error, refetch } = useGetAllOrders();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'completed'>('all');

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
        <p className="text-gray-500 text-sm text-center">Please login as admin to access the dashboard.</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'Form Submitted' || order.status === 'Under Review';
    if (activeTab === 'accepted') return order.status === 'Accepted' || order.status === 'Payment Pending' || order.status === 'Payment Confirmed';
    if (activeTab === 'rejected') return order.status === 'Rejected';
    if (activeTab === 'completed') return order.status === 'Completed';
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => Number(b.orderId) - Number(a.orderId));

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Form Submitted' || o.status === 'Under Review').length,
    accepted: orders.filter(o => o.status === 'Accepted' || o.status === 'Payment Pending' || o.status === 'Payment Confirmed').length,
    completed: orders.filter(o => o.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-orange-100 text-sm">Vijay Computer Center</p>
          </div>
          {onNavigateQR && (
            <button
              onClick={onNavigateQR}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              QR Settings
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-orange-100">Total</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-orange-100">Pending</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <div className="text-xs text-orange-100">Active</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs text-orange-100">Done</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-4 overflow-x-auto">
          {(['all', 'pending', 'accepted', 'rejected', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[60px] text-xs font-semibold py-2 px-2 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-orange-700 text-sm font-medium mb-2">Could not load orders</p>
            <p className="text-orange-600 text-xs mb-3">Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="bg-orange-500 text-white text-xs font-semibold py-2 px-4 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 text-sm">No orders in this category</p>
          </div>
        ) : (
          <div>
            {sortedOrders.map(order => (
              <OrderCard key={order.orderId.toString()} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
