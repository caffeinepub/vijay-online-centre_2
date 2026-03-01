import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, QrCode, CheckCircle } from 'lucide-react';
import { useGetQRSettings, useSetPermQR } from '../hooks/useQueries';

interface AdminQRManagementProps {
  onBack: () => void;
}

export default function AdminQRManagement({ onBack }: AdminQRManagementProps) {
  const { data: qrSettings } = useGetQRSettings();
  const setPermQR = useSetPermQR();

  const [activeTab, setActiveTab] = useState<'permanent' | 'auto'>('permanent');
  const [autoAmount, setAutoAmount] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        await setPermQR.mutateAsync({ base64: dataUrl, autoAmount: BigInt(0) });
        setSuccess('QR image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleUseDefaultQR = async () => {
    setError('');
    try {
      // Use the uploaded ICICI Bank QR image as default
      await setPermQR.mutateAsync({
        base64: '/assets/generated/vijay-logo.dim_512x512.png',
        autoAmount: BigInt(0)
      });
      setSuccess('Default QR set successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set default QR');
    }
  };

  const handleSetAutoAmount = async () => {
    if (!autoAmount || isNaN(Number(autoAmount)) || Number(autoAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    try {
      await setPermQR.mutateAsync({
        base64: qrSettings?.permanentQrKey || '',
        autoAmount: BigInt(Math.round(Number(autoAmount)))
      });
      setSuccess(`Auto QR amount set to ₹${autoAmount}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set amount');
    }
  };

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
          <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>QR Management</h1>
          <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>Payment QR settings</p>
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6"
          style={{ background: 'oklch(0.22 0.06 240)' }}>
          <button
            onClick={() => setActiveTab('permanent')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === 'permanent' ? 'oklch(0.35 0.08 240)' : 'transparent',
              color: activeTab === 'permanent' ? 'oklch(0.97 0.005 240)' : 'oklch(0.62 0.015 240)',
            }}>
            Permanent QR
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === 'auto' ? 'oklch(0.35 0.08 240)' : 'transparent',
              color: activeTab === 'auto' ? 'oklch(0.97 0.005 240)' : 'oklch(0.62 0.015 240)',
            }}>
            Auto QR
          </button>
        </div>

        {/* Success/Error */}
        {success && (
          <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"
            style={{ background: 'oklch(0.5 0.15 145 / 20%)', border: '1px solid oklch(0.5 0.15 145 / 40%)', color: 'oklch(0.7 0.15 145)' }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm mb-4"
            style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
            {error}
          </div>
        )}

        {activeTab === 'permanent' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4"
              style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Current QR Status
              </p>
              {qrSettings?.permanentQrKey ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} style={{ color: 'oklch(0.6 0.15 145)' }} />
                  <p className="text-xs" style={{ color: 'oklch(0.72 0.015 240)' }}>
                    Permanent QR is set and active
                  </p>
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                  No permanent QR set yet
                </p>
              )}
            </div>

            {/* Current QR Preview */}
            {qrSettings?.permanentQrKey && (
              <div className="rounded-2xl p-4 flex flex-col items-center"
                style={{ background: 'oklch(0.97 0.005 240)' }}>
                <img
                  src={qrSettings.permanentQrKey}
                  alt="Current QR"
                  className="w-40 h-40 object-contain"
                />
                <p className="text-xs mt-2" style={{ color: 'oklch(0.35 0.08 240)' }}>Current QR Code</p>
              </div>
            )}

            {/* Upload New QR */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleQRImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={setPermQR.isPending}
              className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ borderColor: 'oklch(0.35 0.08 240)', background: 'oklch(0.18 0.05 240)' }}>
              <Upload size={24} style={{ color: 'oklch(0.78 0.12 85)' }} />
              <p className="text-sm font-medium" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Upload New QR Image
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Upload your UPI QR code image
              </p>
            </button>

            <button
              onClick={handleUseDefaultQR}
              disabled={setPermQR.isPending}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'oklch(0.22 0.06 240)', color: 'oklch(0.82 0.012 240)', border: '1px solid oklch(0.35 0.08 240)' }}>
              Use ICICI Bank QR (Default)
            </button>
          </div>
        )}

        {activeTab === 'auto' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4"
              style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Auto QR Generation
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Set a fixed amount for auto-generated UPI QR codes shown to customers
              </p>
            </div>

            {qrSettings && Number(qrSettings.autoQrAmount) > 0 && (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'oklch(0.78 0.12 85 / 10%)', border: '1px solid oklch(0.78 0.12 85 / 30%)' }}>
                <QrCode size={20} style={{ color: 'oklch(0.78 0.12 85)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'oklch(0.72 0.015 240)' }}>Current Auto Amount</p>
                  <p className="text-lg font-bold" style={{ color: 'oklch(0.78 0.12 85)' }}>
                    ₹{qrSettings.autoQrAmount.toString()}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                Set Amount (₹)
              </label>
              <input
                type="number"
                value={autoAmount}
                onChange={e => setAutoAmount(e.target.value)}
                placeholder="Enter amount in rupees"
                min="1"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
              />
            </div>

            <button
              onClick={handleSetAutoAmount}
              disabled={setPermQR.isPending}
              className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
              {setPermQR.isPending ? 'Saving...' : 'Set Auto QR Amount'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
