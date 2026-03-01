import React from 'react';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGetOrdersByCustomer } from '../hooks/useQueries';
import type { ServiceOrder } from '../backend';

interface MyOrdersProps {
  onViewOrder: (orderId: string) => void;
  onViewReceipt: (orderId: string) => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  'Form Submitted': {
    color: 'oklch(0.78 0.12 85)',
    bg: 'oklch(0.78 0.12 85 / 15%)',
    icon: <Clock size={12} />,
    label: 'Submitted'
  },
  'Payment Completed': {
    color: 'oklch(0.6 0.15 200)',
    bg: 'oklch(0.6 0.15 200 / 15%)',
    icon: <CheckCircle size={12} />,
    label: 'Payment Done'
  },
  'Processing': {
    color: 'oklch(0.65 0.15 300)',
    bg: 'oklch(0.65 0.15 300 / 15%)',
    icon: <Loader size={12} />,
    label: 'Processing'
  },
  'Filling Completed': {
    color: 'oklch(0.6 0.15 145)',
    bg: 'oklch(0.6 0.15 145 / 15%)',
    icon: <CheckCircle size={12} />,
    label: 'Completed'
  },
  'Rejected': {
    color: 'oklch(0.7 0.15 27)',
    bg: 'oklch(0.7 0.15 27 / 15%)',
    icon: <XCircle size={12} />,
    label: 'Rejected'
  },
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function MyOrders({ onViewOrder, onViewReceipt }: MyOrdersProps) {
  const { customerSession } = useAuth();
  const { data: orders, isLoading, error } = useGetOrdersByCustomer(customerSession?.mobile || '');

  const sortedOrders = [...(orders || [])].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>My Orders</h1>
        <p className="text-xs mt-1 font-devanagari" style={{ color: 'oklch(0.62 0.015 240)' }}>
          मेरे आवेदन — {sortedOrders.length} orders
        </p>
      </div>

      <div className="px-4 py-4 pb-24">
        {isLoading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.78 0.12 85)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'oklch(0.62 0.015 240)' }}>Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
            Failed to load orders. Please try again.
          </div>
        )}

        {!isLoading && sortedOrders.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Package size={48} style={{ color: 'oklch(0.35 0.08 240)' }} />
            <p className="font-medium" style={{ color: 'oklch(0.62 0.015 240)' }}>No orders yet</p>
            <p className="text-sm text-center" style={{ color: 'oklch(0.45 0.02 240)' }}>
              Apply for a service to see your orders here
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sortedOrders.map((order: ServiceOrder) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Form Submitted'];
            const isCompleted = order.status === 'Filling Completed';

            return (
              <div key={order.orderId.toString()}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'oklch(0.97 0.005 240)' }}>
                        {order.serviceName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'oklch(0.62 0.015 240)' }}>
                        Order #{order.orderId.toString()} · {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewOrder(order.orderId.toString())}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ background: 'oklch(0.22 0.06 240)', color: 'oklch(0.82 0.012 240)' }}>
                      Track Order <ChevronRight size={12} />
                    </button>
                    {isCompleted && (
                      <button
                        onClick={() => onViewReceipt(order.orderId.toString())}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                        style={{ background: 'oklch(0.6 0.15 145 / 20%)', color: 'oklch(0.6 0.15 145)' }}>
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
