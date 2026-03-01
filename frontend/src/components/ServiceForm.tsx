import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, CheckCircle, X, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubmitOrder } from '../hooks/useQueries';
import { ExternalBlob } from '../lib/blobStorage';

interface ServiceFormProps {
  serviceName: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export default function ServiceForm({ serviceName, onBack, onSuccess }: ServiceFormProps) {
  const { customerSession } = useAuth();
  const submitOrder = useSubmitOrder();

  const [name, setName] = useState(customerSession?.name || '');
  const [mobile, setMobile] = useState(customerSession?.mobile || '');
  const [address, setAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(f);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !mobile.trim() || !address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    try {
      let documentKey = '';

      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        documentKey = blob.getDirectURL();
      }

      const orderId = await submitOrder.mutateAsync({
        customerId: customerSession?.mobile || mobile,
        serviceName,
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        documentKey,
        amount: BigInt(0),
      });

      setSubmitted(true);
      onSuccess(orderId.toString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 page-enter"
        style={{ background: 'oklch(0.14 0.04 240)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'oklch(0.5 0.15 145 / 20%)', border: '2px solid oklch(0.5 0.15 145 / 40%)' }}>
          <CheckCircle size={40} style={{ color: 'oklch(0.6 0.15 145)' }} />
        </div>
        <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'oklch(0.97 0.005 240)' }}>
          Form Submitted!
        </h2>
        <p className="text-sm text-center mb-2" style={{ color: 'oklch(0.72 0.015 240)' }}>
          Your application for <strong style={{ color: 'oklch(0.78 0.12 85)' }}>{serviceName}</strong> has been submitted successfully.
        </p>
        <p className="text-xs text-center mb-8" style={{ color: 'oklch(0.62 0.015 240)' }}>
          You can track your order status in "My Orders"
        </p>
        <button onClick={onBack}
          className="px-8 py-3 rounded-xl font-semibold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <button onClick={onBack} className="p-2 rounded-xl mr-3 transition-all active:scale-95"
          style={{ background: 'oklch(0.22 0.06 240)' }}>
          <ArrowLeft size={20} style={{ color: 'oklch(0.82 0.012 240)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate" style={{ color: 'oklch(0.97 0.005 240)' }}>
            {serviceName}
          </h1>
          <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
            Application Form
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 pb-24 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
            Full Name <span style={{ color: 'oklch(0.78 0.12 85)' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)', color: 'oklch(0.97 0.005 240)' }}
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
            Mobile Number <span style={{ color: 'oklch(0.78 0.12 85)' }}>*</span>
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)', color: 'oklch(0.97 0.005 240)' }}
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
            Address <span style={{ color: 'oklch(0.78 0.12 85)' }}>*</span>
          </label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter your full address"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)', color: 'oklch(0.97 0.005 240)' }}
            required
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
            Upload Document
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all active:scale-95"
            style={{ borderColor: 'oklch(0.35 0.08 240)', background: 'oklch(0.18 0.05 240)' }}
          >
            {file ? (
              <>
                <FileText size={24} style={{ color: 'oklch(0.78 0.12 85)' }} />
                <p className="text-sm font-medium" style={{ color: 'oklch(0.97 0.005 240)' }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload size={24} style={{ color: 'oklch(0.62 0.015 240)' }} />
                <p className="text-sm" style={{ color: 'oklch(0.72 0.015 240)' }}>
                  Tap to upload document
                </p>
                <p className="text-xs" style={{ color: 'oklch(0.45 0.02 240)' }}>
                  Image (JPG, PNG) or PDF · Max 10MB
                </p>
              </>
            )}
          </button>
          {file && (
            <button type="button" onClick={() => setFile(null)}
              className="mt-2 flex items-center gap-1 text-xs"
              style={{ color: 'oklch(0.7 0.15 27)' }}>
              <X size={12} /> Remove file
            </button>
          )}
        </div>

        {/* Upload Progress */}
        {submitOrder.isPending && uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'oklch(0.72 0.015 240)' }}>
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.22 0.06 240)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))' }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitOrder.isPending}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}
        >
          {submitOrder.isPending ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
