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

export default function Receipt({ orderId, onBack }: ReceiptProps) {
  const { data: order, isLoading, error } = useGetOrderById(orderId);

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
          {/* Logo / Shop Name */}
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
          {order.amount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-xl font-bold text-orange-600">₹{order.amount.toString()}</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Current Status</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                order.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Progress */}
          {order.status !== 'Rejected' && stepIndex >= 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Progress</p>
              <div className="flex items-center gap-1">
                {STATUS_STEPS.map((step, idx) => (
                  <div
                    key={step}
                    className={`flex-1 h-1.5 rounded-full ${
                      idx <= stepIndex ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                    title={step}
                  />
                ))}
              </div>
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Step {stepIndex + 1} of {STATUS_STEPS.length}: {order.status}
              </p>
            </div>
          )}

          {/* Attachments */}
          {(order.photoDataBase64 || order.documentDataBase64) && (
            <div className="pt-4 border-t border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-medium">Attachments</p>
              <div className="flex gap-2">
                {order.photoDataBase64 && (
                  <button
                    onClick={() => openAttachment(order.photoDataBase64, 'image/jpeg')}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors border border-blue-200"
                  >
                    📷 Photo
                  </button>
                )}
                {order.documentDataBase64 && (
                  <button
                    onClick={() => openAttachment(order.documentDataBase64, 'application/pdf')}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors border border-indigo-200"
                  >
                    📄 Document
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Thank you for choosing Vijay Computer Center</p>
          <p className="mt-1">For queries, please contact us</p>
        </div>
      </div>
    </div>
  );
}
