import React from 'react';
import { ArrowLeft, Clock, CreditCard, Settings, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGetOrdersByCustomer, useGetAllOrders } from '../hooks/useQueries';
import type { ServiceOrder } from '../backend';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
  onViewReceipt: (orderId: string) => void;
}

const STAGES = [
  { key: 'Form Submitted', label: 'Form Submitted', sublabel: 'फॉर्म जमा', icon: Clock },
  { key: 'Payment Completed', label: 'Payment Done', sublabel: 'भुगतान पूर्ण', icon: CreditCard },
  { key: 'Processing', label: 'Processing', sublabel: 'प्रक्रिया में', icon: Settings },
  { key: 'Filling Completed', label: 'Completed', sublabel: 'पूर्ण', icon: Award },
];

function getStageIndex(status: string): number {
  const idx = STAGES.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function OrderTracking({ orderId, onBack, onViewReceipt }: OrderTrackingProps) {
  const { customerSession, isAdmin } = useAuth();

  const customerOrders = useGetOrdersByCustomer(customerSession?.mobile || '');
  const adminOrders = useGetAllOrders();

  const ordersData = isAdmin ? adminOrders.data : customerOrders.data;
  const isLoading = isAdmin ? adminOrders.isLoading : customerOrders.isLoading;

  const order = ordersData?.find((o: ServiceOrder) => o.orderId.toString() === orderId);
  const currentStageIdx = order ? getStageIndex(order.status) : 0;
  const isRejected = order?.status === 'Rejected';

  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <button onClick={onBack} className="p-2 rounded-xl mr-3 transition-all active:scale-95"
          style={{ background: 'oklch(0.22 0.06 240)' }}>
          <ArrowLeft size={20} style={{ color: 'oklch(0.82 0.012 240)' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>Order Tracking</h1>
          <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>Order #{orderId}</p>
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.78 0.12 85)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!isLoading && !order && (
          <div className="text-center py-12">
            <p style={{ color: 'oklch(0.62 0.015 240)' }}>Order not found</p>
          </div>
        )}

        {order && (
          <>
            {/* Order Info Card */}
            <div className="rounded-2xl p-4 mb-6"
              style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
              <p className="text-base font-bold mb-1" style={{ color: 'oklch(0.97 0.005 240)' }}>
                {order.serviceName}
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Submitted: {formatDate(order.timestamp)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Applicant: {order.name} · {order.mobile}
              </p>
              {Number(order.amount) > 0 && (
                <p className="text-xs mt-0.5 font-semibold" style={{ color: 'oklch(0.78 0.12 85)' }}>
                  Amount: ₹{order.amount.toString()}
                </p>
              )}
            </div>

            {/* Rejected State */}
            {isRejected && (
              <div className="rounded-2xl p-4 mb-6 text-center"
                style={{ background: 'oklch(0.577 0.245 27.325 / 15%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)' }}>
                <p className="text-lg font-bold mb-1" style={{ color: 'oklch(0.85 0.15 27)' }}>
                  ❌ Application Rejected
                </p>
                <p className="text-sm" style={{ color: 'oklch(0.72 0.015 240)' }}>
                  Please contact us for more information
                </p>
              </div>
            )}

            {/* Progress Stepper */}
            {!isRejected && (
              <div className="rounded-2xl p-5 mb-6"
                style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
                <h3 className="text-sm font-semibold mb-5" style={{ color: 'oklch(0.72 0.015 240)' }}>
                  APPLICATION PROGRESS
                </h3>

                <div className="relative">
                  {/* Background line */}
                  <div className="absolute left-5 top-5 w-0.5"
                    style={{
                      background: 'oklch(0.28 0.07 240)',
                      height: `calc(100% - 2.5rem)`
                    }} />
                  {/* Progress line */}
                  <div className="absolute left-5 top-5 w-0.5 transition-all duration-700"
                    style={{
                      background: 'linear-gradient(to bottom, oklch(0.78 0.12 85), oklch(0.6 0.15 145))',
                      height: currentStageIdx === 0
                        ? '0%'
                        : `calc(${(currentStageIdx / (STAGES.length - 1)) * 100}% * (100% - 2.5rem) / 100%)`,
                    }} />

                  <div className="space-y-6">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIdx;
                      const isActive = idx === currentStageIdx;
                      const Icon = stage.icon;

                      return (
                        <div key={stage.key} className="flex items-start gap-4 relative">
                          {/* Circle */}
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all"
                            style={{
                              background: isCompleted
                                ? 'oklch(0.6 0.15 145)'
                                : isActive
                                  ? 'oklch(0.78 0.12 85)'
                                  : 'oklch(0.22 0.06 240)',
                              border: isActive ? '2px solid oklch(0.88 0.10 85)' : 'none',
                              boxShadow: isActive ? '0 0 12px oklch(0.78 0.12 85 / 40%)' : 'none',
                            }}>
                            <Icon size={18} style={{
                              color: isCompleted || isActive
                                ? 'oklch(0.14 0.04 240)'
                                : 'oklch(0.45 0.02 240)'
                            }} />
                          </div>

                          {/* Text */}
                          <div className="pt-1.5">
                            <p className="text-sm font-semibold" style={{
                              color: isCompleted || isActive
                                ? 'oklch(0.97 0.005 240)'
                                : 'oklch(0.45 0.02 240)'
                            }}>
                              {stage.label}
                            </p>
                            <p className="text-xs font-devanagari" style={{
                              color: isCompleted || isActive
                                ? 'oklch(0.72 0.015 240)'
                                : 'oklch(0.35 0.08 240)'
                            }}>
                              {stage.sublabel}
                            </p>
                            {isActive && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'oklch(0.78 0.12 85 / 20%)', color: 'oklch(0.78 0.12 85)' }}>
                                Current Stage
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View Receipt Button */}
            {order.status === 'Filling Completed' && (
              <button
                onClick={() => onViewReceipt(orderId)}
                className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
                🧾 View & Print Receipt
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
