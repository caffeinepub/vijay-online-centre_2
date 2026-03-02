import React from 'react';
import { useGetOrderById } from '../hooks/useQueries';

interface ReceiptProps {
  orderId: string;
  onBack: () => void;
}

const STATUS_STEPS = [
  'Form Submitted',
  'Under Review',
  'Accepted',
  'Payment Pending',
  'Payment Confirmed',
  'Completed',
];

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

export default function Receipt({ orderId, onBack }: ReceiptProps) {
  // Convert string orderId to bigint for the hook
  const orderIdBigInt = orderId ? BigInt(orderId) : null;
  const { data: order, isLoading, error } = useGetOrderById(orderIdBigInt);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 text-sm">Loading receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Receipt Not Found</h2>
        <p className="text-gray-500 text-sm mb-4">Could not find receipt for order #{orderId}</p>
        <button onClick={onBack} className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-6">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Receipt</h1>
        <p className="text-orange-100 text-sm">Order #{orderId}</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Receipt Card */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          {/* Shop Name */}
          <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Vijay Computer Center</h2>
            <p className="text-xs text-gray-500">Official Service Receipt</p>
          </div>

          {/* Order Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold text-gray-800">#{order.orderId.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-800">{order.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-semibold text-gray-800">{order.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mobile</span>
              <span className="font-semibold text-gray-800">{order.mobile}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Address</span>
              <span className="font-semibold text-gray-800 text-right max-w-[60%]">{order.address}</span>
            </div>
          </div>

          {/* Amount */}
          {order.amount > 0n && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-orange-700">Total Amount</span>
                <span className="text-xl font-bold text-orange-700">₹{order.amount.toString()}</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-500">Status</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              order.status === 'Completed'
                ? 'bg-green-100 text-green-700'
                : order.status === 'Rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {order.status}
            </span>
          </div>

          {/* Progress bar */}
          {stepIndex >= 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{stepIndex + 1}/{STATUS_STEPS.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${((stepIndex + 1) / STATUS_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

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

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Thank you for choosing Vijay Computer Center</p>
          <p className="text-xs text-gray-400 mt-1">For queries, contact us on WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
