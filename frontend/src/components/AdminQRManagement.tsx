import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGetQRSettings, useSetPermQR } from '../hooks/useQueries';

interface AdminQRManagementProps {
  onBack?: () => void;
}

export default function AdminQRManagement({ onBack }: AdminQRManagementProps) {
  const { isAdminLoggedIn } = useAuth();
  const { data: qrSettings, isLoading } = useGetQRSettings();
  const setPermQR = useSetPermQR();

  const [activeTab, setActiveTab] = useState<'permanent' | 'auto'>('permanent');
  const [autoAmount, setAutoAmount] = useState('');
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
        <p className="text-gray-500 text-sm text-center">Please login as admin to manage QR settings.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 bg-orange-500 text-white font-semibold py-2 px-6 rounded-xl"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setQrPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadQR = async () => {
    if (!qrPreview) {
      setUploadMessage({ type: 'error', text: 'Please select a QR image first.' });
      return;
    }
    setUploadMessage(null);
    try {
      const amount = autoAmount ? BigInt(parseInt(autoAmount, 10)) : BigInt(qrSettings?.autoQrAmount || 0);
      await setPermQR.mutateAsync({ base64: qrPreview, autoAmount: amount });
      setUploadMessage({ type: 'success', text: 'QR settings saved successfully!' });
      setQrPreview(null);
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('admin')) {
        setUploadMessage({ type: 'error', text: 'Could not save QR. Please refresh the page and try again.' });
      } else {
        setUploadMessage({ type: 'error', text: 'Failed to save QR settings. Please try again.' });
      }
      setTimeout(() => setUploadMessage(null), 4000);
    }
  };

  const currentQR = qrSettings?.permanentQrKey || '';
  const currentAmount = qrSettings?.autoQrAmount ? Number(qrSettings.autoQrAmount) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-8">
        {onBack && (
          <button onClick={onBack} className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1">
            ← Back
          </button>
        )}
        <h1 className="text-xl font-bold">QR Management</h1>
        <p className="text-orange-100 text-sm">Manage payment QR codes</p>
      </div>

      <div className="px-4 -mt-2">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-4">
          <button
            onClick={() => setActiveTab('permanent')}
            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'permanent' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Permanent QR
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'auto' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Auto QR Amount
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'permanent' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="font-bold text-gray-800 mb-3">Upload Permanent QR Code</h2>

                {/* Current QR */}
                {currentQR && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Current QR Code:</p>
                    <div className="flex justify-center">
                      <img
                        src={currentQR.startsWith('data:') ? currentQR : `data:image/jpeg;base64,${currentQR}`}
                        alt="Current QR"
                        className="w-40 h-40 object-contain border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Upload new QR */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors mb-3"
                >
                  {qrPreview ? (
                    <img src={qrPreview} alt="Preview" className="w-32 h-32 object-contain mx-auto rounded-lg" />
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-sm text-gray-600 font-medium">Tap to select QR image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Default Amount (₹)</label>
                  <input
                    type="number"
                    value={autoAmount}
                    onChange={e => setAutoAmount(e.target.value)}
                    placeholder={currentAmount > 0 ? `Current: ₹${currentAmount}` : 'Enter amount (optional)'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {uploadMessage && (
                  <div className={`text-xs px-3 py-2 rounded-lg mb-3 font-medium ${
                    uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {uploadMessage.text}
                  </div>
                )}

                <button
                  onClick={handleUploadQR}
                  disabled={setPermQR.isPending || !qrPreview}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {setPermQR.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </span>
                  ) : 'Save QR Settings'}
                </button>
              </div>
            )}

            {activeTab === 'auto' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="font-bold text-gray-800 mb-3">Auto QR Amount</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Set the default payment amount for auto-generated QR codes.
                </p>

                {currentAmount > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-orange-600 font-medium">Current Amount</p>
                    <p className="text-2xl font-bold text-orange-700">₹{currentAmount}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Amount (₹)</label>
                  <input
                    type="number"
                    value={autoAmount}
                    onChange={e => setAutoAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {uploadMessage && (
                  <div className={`text-xs px-3 py-2 rounded-lg mb-3 font-medium ${
                    uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {uploadMessage.text}
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (!autoAmount) {
                      setUploadMessage({ type: 'error', text: 'Please enter an amount.' });
                      return;
                    }
                    setUploadMessage(null);
                    try {
                      const amount = BigInt(parseInt(autoAmount, 10));
                      await setPermQR.mutateAsync({ base64: currentQR, autoAmount: amount });
                      setUploadMessage({ type: 'success', text: 'Amount updated successfully!' });
                      setAutoAmount('');
                      setTimeout(() => setUploadMessage(null), 3000);
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : String(err);
                      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('admin')) {
                        setUploadMessage({ type: 'error', text: 'Could not update amount. Please refresh and try again.' });
                      } else {
                        setUploadMessage({ type: 'error', text: 'Failed to update amount. Please try again.' });
                      }
                      setTimeout(() => setUploadMessage(null), 4000);
                    }
                  }}
                  disabled={setPermQR.isPending || !autoAmount}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {setPermQR.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating...
                    </span>
                  ) : 'Update Amount'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
