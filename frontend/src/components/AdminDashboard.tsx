import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Package, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGetAllOrders, useUpdateOrderStatus } from '../hooks/useQueries';
import type { ServiceOrder } from '../backend';

interface AdminDashboardProps {
  onNavigateQR?: () => void;
}

const STATUS_OPTIONS = [
  'Pending',
  'Form Submitted',
  'Under Review',
  'Documents Verified',
  'Processing',
  'Accepted',
  'Payment Pending',
  'Payment Confirmed',
  'Completed',
  'Rejected',
];

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'Form Submitted': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-purple-100 text-purple-800',
  'Documents Verified': 'bg-indigo-100 text-indigo-800',
  Processing: 'bg-orange-100 text-orange-800',
  Accepted: 'bg-green-100 text-green-800',
  'Payment Pending': 'bg-amber-100 text-amber-800',
  'Payment Confirmed': 'bg-teal-100 text-teal-800',
  Completed: 'bg-gray-100 text-gray-800',
  Rejected: 'bg-red-100 text-red-800',
};

function openAttachment(dataBase64: string, defaultMime = 'image/jpeg') {
  if (!dataBase64) return;
  const dataUrl = dataBase64.startsWith('data:')
    ? dataBase64
    : `data:${defaultMime};base64,${dataBase64}`;
  const win = window.open();
  if (win) {
    win.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;" />`);
    win.document.title = 'Attachment';
  }
}

function OrderCard({
  order,
  onStatusChange,
  isUpdating,
}: {
  order: ServiceOrder;
  onStatusChange: (orderId: bigint, status: string) => void;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusClass = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-orange-600 text-sm">#{order.orderId.toString()}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
              {order.status}
            </span>
          </div>
          <p className="font-semibold text-gray-800 mt-1 truncate">{order.name}</p>
          <p className="text-xs text-gray-500">{order.serviceName}</p>
          <p className="text-xs text-gray-500">{order.mobile}</p>
        </div>
        <div className="text-right shrink-0">
          {order.amount > 0n && (
            <p className="font-bold text-green-700">₹{order.amount.toString()}</p>
          )}
          {order.timestamp > 0n && (
            <p className="text-xs text-gray-400">
              {new Date(Number(order.timestamp)).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-orange-500 underline"
      >
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Address:</span> {order.address}
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Customer ID:</span> {order.customerId}
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            {order.photoDataBase64 && (
              <button
                onClick={() => openAttachment(order.photoDataBase64, 'image/jpeg')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors border border-blue-200"
              >
                📷 Photo
              </button>
            )}
            {order.documentDataBase64 && (
              <button
                onClick={() => openAttachment(order.documentDataBase64, 'application/pdf')}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors border border-indigo-200"
              >
                📄 Document
              </button>
            )}
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium mb-1 text-gray-500">
              Update Status:
            </label>
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={order.status}
                onChange={(e) => onStatusChange(order.orderId, e.target.value)}
                disabled={isUpdating}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {isUpdating && (
                <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ onNavigateQR }: AdminDashboardProps) {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isFetching, error, refetch, dataUpdatedAt } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<bigint | null>(null);

  const handleStatusChange = async (orderId: bigint, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    refetch();
  };

  const isPendingStatus = (status: string) =>
    status === 'Pending' || status === 'Form Submitted' || status === 'Under Review';

  const pendingOrders = orders.filter((o) => isPendingStatus(o.status));
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  const displayedOrders = (() => {
    let list: ServiceOrder[];
    if (activeTab === 'pending') list = pendingOrders;
    else if (activeTab === 'completed') list = completedOrders;
    else list = orders;
    return [...list].sort((a, b) => Number(b.orderId) - Number(a.orderId));
  })();

  const stats = [
    { label: 'Total', value: orders.length, icon: Package, color: 'text-blue-600' },
    { label: 'Pending', value: pendingOrders.length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Done', value: completedOrders.length, icon: CheckCircle, color: 'text-green-600' },
  ];

  // Format the last-updated time
  const lastUpdatedText = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-orange-100 text-sm">Vijay Computer Center</p>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin opacity-70" />
            )}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            {onNavigateQR && (
              <button
                onClick={onNavigateQR}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                QR Settings
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/20 rounded-xl p-3 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 text-white`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-orange-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Auto-refresh indicator */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="text-xs text-gray-500">Auto-refreshing every 5s</span>
          </div>
          {lastUpdatedText && (
            <span className="text-xs text-gray-400">Updated: {lastUpdatedText}</span>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">Failed to load orders. Please refresh.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-4">
          {[
            { key: 'all', label: `All (${orders.length})` },
            { key: 'pending', label: `Pending (${pendingOrders.length})` },
            { key: 'completed', label: `Done (${completedOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 text-xs font-semibold py-2 px-2 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm">No orders found</p>
            <button
              onClick={handleRefresh}
              className="text-orange-500 text-sm underline"
            >
              Tap to refresh
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && displayedOrders.length > 0 && (
          <div className="space-y-3">
            {displayedOrders.map((order) => (
              <OrderCard
                key={order.orderId.toString()}
                order={order}
                onStatusChange={handleStatusChange}
                isUpdating={updatingOrderId === order.orderId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
