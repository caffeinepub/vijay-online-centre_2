import React from 'react';
import { useGetOrderById } from '../hooks/useQueries';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
  onViewReceipt?: (orderId: string) => void;
}

const STATUS_STEPS = [
  'Form Submitted',
  'Under Review',
  'Accepted',
  'Payment Pending',
  'Payment Confirmed',
  'Completed',
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.indexOf(status);
  if (idx === -1) {
    if (status === 'Rejected') return -1;
    return 0;
  }
  return idx;
}

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

export default function OrderTracking({ orderId, onBack, onViewReceipt }: OrderTrackingProps) {
  // Convert string orderId to bigint for the hook
  const orderIdBigInt = orderId ? BigInt(orderId) : null;
  const { data: order, isLoading, error } = useGetOrderById(orderIdBigInt);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 text-sm">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-4">Could not find order #{orderId}</p>
        <button onClick={onBack} className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const stepIndex = getStepIndex(order.status);
  const isRejected = order.status === 'Rejected';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-6">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Order Tracking</h1>
        <p className="text-orange-100 text-sm">Order #{orderId}</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="font-bold text-gray-800">{order.serviceName}</h2>
              <p className="text-sm text-gray-500">{order.name} · {order.mobile}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isRejected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-500">{order.address}</p>
          {order.amount > 0n && (
            <p className="text-sm font-bold text-orange-600 mt-2">Amount: ₹{order.amount.toString()}</p>
          )}
        </div>

        {/* Progress Steps */}
        {isRejected ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <h3 className="font-bold text-red-700">Application Rejected</h3>
            <p className="text-sm text-red-600 mt-1">Please contact us for more information.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Progress</h3>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isCompleted
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isCurrent ? 'text-orange-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-orange-500">Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View Receipt button */}
        {onViewReceipt && (order.status === 'Payment Confirmed' || order.status === 'Completed') && (
          <button
            onClick={() => onViewReceipt(order.orderId.toString())}
            className="w-full bg-white border border-orange-300 text-orange-600 font-semibold py-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            📄 View Receipt
          </button>
        )}

        {/* Attachments */}
        {(order.photoDataBase64 || order.documentDataBase64) && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Attachments</h3>
            <div className="flex gap-2">
              {order.photoDataBase64 && (
                <button
                  onClick={() => openAttachment(order.photoDataBase64, 'image/jpeg')}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors border border-blue-200"
                >
                  📷 View Photo
                </button>
              )}
              {order.documentDataBase64 && (
                <button
                  onClick={() => openAttachment(order.documentDataBase64, 'application/pdf')}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors border border-indigo-200"
                >
                  📄 View Document
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
