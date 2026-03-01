import React, { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, CreditCard, ChevronDown, ChevronUp, FileText, Settings } from 'lucide-react';
import { useGetAllOrders, useUpdateOrderStatus, useConfirmPayment } from '../hooks/useQueries';
import type { ServiceOrder } from '../backend';

interface AdminDashboardProps {
  onNavigateQR: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  'Form Submitted': { color: 'oklch(0.78 0.12 85)', bg: 'oklch(0.78 0.12 85 / 15%)' },
  'Payment Completed': { color: 'oklch(0.6 0.15 200)', bg: 'oklch(0.6 0.15 200 / 15%)' },
  'Processing': { color: 'oklch(0.65 0.15 300)', bg: 'oklch(0.65 0.15 300 / 15%)' },
  'Filling Completed': { color: 'oklch(0.6 0.15 145)', bg: 'oklch(0.6 0.15 145 / 15%)' },
  'Rejected': { color: 'oklch(0.7 0.15 27)', bg: 'oklch(0.7 0.15 27 / 15%)' },
};

function OrderCard({ order, onAccept, onReject, onConfirmPayment, isUpdating }: {
  order: ServiceOrder;
  onAccept: (id: bigint) => void;
  onReject: (id: bigint) => void;
  onConfirmPayment: (id: bigint) => void;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_COLORS[order.status] || STATUS_COLORS['Form Submitted'];

  return (
    <div className="rounded-2xl overflow-hidden mb-3"
      style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: statusCfg.bg, color: statusCfg.color }}>
              {order.status}
            </span>
            <span className="text-xs" style={{ color: 'oklch(0.45 0.02 240)' }}>
              #{order.orderId.toString()}
            </span>
          </div>
          <p className="text-sm font-bold truncate" style={{ color: 'oklch(0.97 0.005 240)' }}>
            {order.serviceName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'oklch(0.72 0.015 240)' }}>
            {order.name} · {order.mobile}
          </p>
          <p className="text-xs" style={{ color: 'oklch(0.45 0.02 240)' }}>
            {formatDate(order.timestamp)}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded
            ? <ChevronUp size={16} style={{ color: 'oklch(0.62 0.015 240)' }} />
            : <ChevronDown size={16} style={{ color: 'oklch(0.62 0.015 240)' }} />
          }
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'oklch(0.28 0.07 240)' }}>
          <div className="pt-3">
            <p className="text-xs font-medium mb-1" style={{ color: 'oklch(0.62 0.015 240)' }}>ADDRESS</p>
            <p className="text-sm" style={{ color: 'oklch(0.82 0.012 240)' }}>{order.address}</p>
          </div>

          {order.documentKey && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'oklch(0.62 0.015 240)' }}>DOCUMENT</p>
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'oklch(0.22 0.06 240)' }}>
                <FileText size={20} style={{ color: 'oklch(0.78 0.12 85)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'oklch(0.82 0.012 240)' }}>
                    Document uploaded
                  </p>
                </div>
                {order.documentKey.startsWith('blob:') || order.documentKey.startsWith('http') ? (
                  <a href={order.documentKey} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}>
                    View
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {Number(order.amount) > 0 && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'oklch(0.62 0.015 240)' }}>AMOUNT</p>
              <p className="text-sm font-bold" style={{ color: 'oklch(0.78 0.12 85)' }}>
                ₹{order.amount.toString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {order.status === 'Form Submitted' && (
              <>
                <button
                  onClick={() => onAccept(order.orderId)}
                  disabled={isUpdating}
                  className="py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'oklch(0.5 0.15 145 / 20%)', color: 'oklch(0.6 0.15 145)', border: '1px solid oklch(0.5 0.15 145 / 40%)' }}>
                  <CheckCircle size={14} /> Accept
                </button>
                <button
                  onClick={() => onReject(order.orderId)}
                  disabled={isUpdating}
                  className="py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', color: 'oklch(0.7 0.15 27)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)' }}>
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}

            {order.status === 'Payment Completed' && (
              <button
                onClick={() => onAccept(order.orderId)}
                disabled={isUpdating}
                className="col-span-2 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'oklch(0.65 0.15 300 / 20%)', color: 'oklch(0.65 0.15 300)', border: '1px solid oklch(0.65 0.15 300 / 40%)' }}>
                <Settings size={14} /> Mark as Processing
              </button>
            )}

            {order.status === 'Processing' && (
              <button
                onClick={() => onAccept(order.orderId)}
                disabled={isUpdating}
                className="col-span-2 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'oklch(0.6 0.15 145 / 20%)', color: 'oklch(0.6 0.15 145)', border: '1px solid oklch(0.6 0.15 145 / 40%)' }}>
                <CheckCircle size={14} /> Mark as Completed
              </button>
            )}

            {order.status === 'Form Submitted' && (
              <button
                onClick={() => onConfirmPayment(order.orderId)}
                disabled={isUpdating}
                className="col-span-2 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'oklch(0.6 0.15 200 / 20%)', color: 'oklch(0.6 0.15 200)', border: '1px solid oklch(0.6 0.15 200 / 40%)' }}>
                <CreditCard size={14} /> Confirm Payment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ onNavigateQR }: AdminDashboardProps) {
  const { data: orders, isLoading, refetch, isFetching } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const confirmPayment = useConfirmPayment();
  const [filter, setFilter] = useState<string>('all');

  const STATUS_FLOW: Record<string, string> = {
    'Form Submitted': 'Payment Completed',
    'Payment Completed': 'Processing',
    'Processing': 'Filling Completed',
  };

  const handleAccept = async (orderId: bigint) => {
    const order = orders?.find(o => o.orderId === orderId);
    if (!order) return;
    const nextStatus = STATUS_FLOW[order.status];
    if (nextStatus) {
      await updateStatus.mutateAsync({ orderId, status: nextStatus });
    }
  };

  const handleReject = async (orderId: bigint) => {
    await updateStatus.mutateAsync({ orderId, status: 'Rejected' });
  };

  const handleConfirmPayment = async (orderId: bigint) => {
    await confirmPayment.mutateAsync(orderId);
  };

  const sortedOrders = [...(orders || [])].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const filteredOrders = filter === 'all'
    ? sortedOrders
    : sortedOrders.filter(o => o.status === filter);

  const statusCounts = sortedOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filterOptions = [
    { key: 'all', label: 'All', count: sortedOrders.length },
    { key: 'Form Submitted', label: 'New', count: statusCounts['Form Submitted'] || 0 },
    { key: 'Payment Completed', label: 'Paid', count: statusCounts['Payment Completed'] || 0 },
    { key: 'Processing', label: 'Processing', count: statusCounts['Processing'] || 0 },
    { key: 'Filling Completed', label: 'Done', count: statusCounts['Filling Completed'] || 0 },
  ];

  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>Admin Dashboard</h1>
            <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
              {sortedOrders.length} total orders
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onNavigateQR}
              className="p-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'oklch(0.22 0.06 240)' }}>
              <CreditCard size={18} style={{ color: 'oklch(0.78 0.12 85)' }} />
            </button>
            <button onClick={() => refetch()}
              className="p-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'oklch(0.22 0.06 240)' }}>
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''}
                style={{ color: 'oklch(0.82 0.012 240)' }} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filter === opt.key ? 'oklch(0.78 0.12 85)' : 'oklch(0.22 0.06 240)',
                color: filter === opt.key ? 'oklch(0.14 0.04 240)' : 'oklch(0.72 0.015 240)',
              }}>
              {opt.label} {opt.count > 0 && `(${opt.count})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.78 0.12 85)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium" style={{ color: 'oklch(0.62 0.015 240)' }}>No orders found</p>
          </div>
        )}

        {filteredOrders.map(order => (
          <OrderCard
            key={order.orderId.toString()}
            order={order}
            onAccept={handleAccept}
            onReject={handleReject}
            onConfirmPayment={handleConfirmPayment}
            isUpdating={updateStatus.isPending || confirmPayment.isPending}
          />
        ))}
      </div>
    </div>
  );
}
