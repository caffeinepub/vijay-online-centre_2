import React from 'react';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGetOrdersByCustomer, useGetAllOrders } from '../hooks/useQueries';
import type { ServiceOrder } from '../backend';

interface ReceiptProps {
  orderId: string;
  onBack: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Receipt({ orderId, onBack }: ReceiptProps) {
  const { customerSession, isAdmin } = useAuth();

  const customerOrders = useGetOrdersByCustomer(customerSession?.mobile || '');
  const adminOrders = useGetAllOrders();

  const ordersData = isAdmin ? adminOrders.data : customerOrders.data;
  const isLoading = isAdmin ? adminOrders.isLoading : customerOrders.isLoading;

  const order: ServiceOrder | undefined = ordersData?.find(
    (o: ServiceOrder) => o.orderId.toString() === orderId
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header - no-print */}
      <div className="no-print flex items-center px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <button onClick={onBack} className="p-2 rounded-xl mr-3 transition-all active:scale-95"
          style={{ background: 'oklch(0.22 0.06 240)' }}>
          <ArrowLeft size={20} style={{ color: 'oklch(0.82 0.012 240)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>Receipt</h1>
          <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>Order #{orderId}</p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: 'oklch(0.78 0.12 85)', color: 'oklch(0.14 0.04 240)' }}>
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="px-4 py-6 pb-24">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.78 0.12 85)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!isLoading && !order && (
          <div className="text-center py-12">
            <p style={{ color: 'oklch(0.62 0.015 240)' }}>Receipt not found</p>
          </div>
        )}

        {order && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'oklch(0.97 0.005 240)', border: '2px solid oklch(0.78 0.12 85 / 40%)' }}>
            {/* Receipt Header */}
            <div className="p-6 text-center"
              style={{ background: 'linear-gradient(135deg, oklch(0.14 0.04 240), oklch(0.22 0.06 240))' }}>
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ border: '2px solid oklch(0.78 0.12 85)' }}>
                  <img src="/assets/generated/vijay-logo.dim_512x512.png" alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      if (t.parentElement) t.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:oklch(0.78 0.12 85)">V</div>';
                    }}
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Vijay Online Centre
              </h2>
              <p className="text-xs mt-1 font-devanagari" style={{ color: 'oklch(0.82 0.012 240)' }}>
                विजय ऑनलाइन सेंटर
              </p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Digital Services Platform
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: 'oklch(0.5 0.15 145 / 15%)', border: '1px solid oklch(0.5 0.15 145 / 40%)' }}>
                  <CheckCircle size={16} style={{ color: 'oklch(0.5 0.15 145)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'oklch(0.4 0.15 145)' }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed" style={{ borderColor: 'oklch(0.82 0.012 240)' }} />

              {/* Details */}
              <div className="space-y-3">
                {[
                  { label: 'Receipt No.', value: `VOC-${order.orderId.toString().padStart(6, '0')}` },
                  { label: 'Service', value: order.serviceName },
                  { label: 'Applicant Name', value: order.name },
                  { label: 'Mobile', value: order.mobile },
                  { label: 'Address', value: order.address },
                  { label: 'Date & Time', value: formatDate(order.timestamp) },
                  { label: 'Amount Paid', value: Number(order.amount) > 0 ? `₹${order.amount.toString()}` : 'As per service' },
                  { label: 'Payment Status', value: 'Completed' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-xs font-medium flex-shrink-0" style={{ color: 'oklch(0.45 0.02 240)' }}>
                      {label}
                    </span>
                    <span className="text-xs text-right font-semibold" style={{ color: 'oklch(0.18 0.05 240)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed" style={{ borderColor: 'oklch(0.82 0.012 240)' }} />

              {/* Footer */}
              <div className="text-center space-y-1">
                <p className="text-xs font-medium" style={{ color: 'oklch(0.35 0.08 240)' }}>
                  Thank you for using Vijay Online Centre
                </p>
                <p className="text-xs font-devanagari" style={{ color: 'oklch(0.45 0.02 240)' }}>
                  धन्यवाद — विजय ऑनलाइन सेंटर
                </p>
                <p className="text-xs" style={{ color: 'oklch(0.55 0.015 240)' }}>
                  📞 +91 81730 64549
                </p>
                <p className="text-xs" style={{ color: 'oklch(0.65 0.015 240)' }}>
                  © {new Date().getFullYear()} Vijay Online Centre
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
