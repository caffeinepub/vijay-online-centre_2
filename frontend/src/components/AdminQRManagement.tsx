import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, QrCode, IndianRupee, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useGetQRSettings, useSetPermQR, useSetAutoQRAmount } from '../hooks/useQueries';

interface AdminQRManagementProps {
  onBack?: () => void;
}

export default function AdminQRManagement({ onBack }: AdminQRManagementProps) {
  const { data: qrSettings, isLoading: settingsLoading } = useGetQRSettings();
  const setPermQRMutation = useSetPermQR();
  const setAutoAmountMutation = useSetAutoQRAmount();

  const [activeTab, setActiveTab] = useState<'permanent' | 'auto'>('permanent');

  // Permanent QR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto QR amount state
  const [autoAmount, setAutoAmount] = useState('');
  const [amountSuccess, setAmountSuccess] = useState(false);
  const [amountError, setAmountError] = useState('');

  // Populate existing settings on load
  useEffect(() => {
    if (qrSettings) {
      if (qrSettings.autoQrAmount > 0n) {
        setAutoAmount(qrSettings.autoQrAmount.toString());
      }
      if (qrSettings.permanentQrKey) {
        const src = qrSettings.permanentQrKey.startsWith('data:')
          ? qrSettings.permanentQrKey
          : `data:image/png;base64,${qrSettings.permanentQrKey}`;
        setPreviewUrl(src);
      }
    }
  }, [qrSettings]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be smaller than 2MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadQR = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image first');
      return;
    }

    setUploadError('');
    setUploadSuccess(false);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(selectedFile);
      });

      // Extract raw base64 (strip the data:...;base64, prefix)
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const currentAutoAmount = qrSettings?.autoQrAmount ?? BigInt(0);

      await setPermQRMutation.mutateAsync({ base64, autoAmount: currentAutoAmount });

      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(msg);
    }
  };

  const handleSaveAmount = async () => {
    const parsed = parseInt(autoAmount, 10);
    if (isNaN(parsed) || parsed < 0) {
      setAmountError('Please enter a valid amount (0 or more)');
      return;
    }

    setAmountError('');
    setAmountSuccess(false);

    try {
      await setAutoAmountMutation.mutateAsync(BigInt(parsed));
      setAmountSuccess(true);
      setTimeout(() => setAmountSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save amount. Please try again.';
      setAmountError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
        <div className="flex items-center gap-3">
          <QrCode className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-bold">QR Management</h1>
            <p className="text-orange-100 text-sm">Manage payment QR code</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 pt-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-5">
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

        {settingsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* Permanent QR Tab */}
            {activeTab === 'permanent' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-orange-500" />
                    <h2 className="font-bold text-gray-800">Upload QR Image</h2>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mb-4 flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        {selectedFile ? 'New QR Preview:' : 'Current QR:'}
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-inner">
                        <img
                          src={previewUrl}
                          alt="QR Code"
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* File picker */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors mb-3"
                  >
                    <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Tap to select QR image'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {uploadError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>QR image saved successfully!</span>
                    </div>
                  )}

                  <button
                    onClick={handleUploadQR}
                    disabled={!selectedFile || setPermQRMutation.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {setPermQRMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save QR Image
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-xs text-orange-700">
                    <span className="font-semibold">Tip:</span> Upload your UPI QR code image here.
                    It will be shown to customers on the payment screen.
                    Keep the image clear and under 2MB for best results.
                  </p>
                </div>
              </div>
            )}

            {/* Auto QR Amount Tab */}
            {activeTab === 'auto' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <IndianRupee className="w-5 h-5 text-orange-500" />
                    <h2 className="font-bold text-gray-800">Default Payment Amount</h2>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Set a default amount shown on the payment screen.
                  </p>

                  {qrSettings && qrSettings.autoQrAmount > 0n && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                      <p className="text-xs text-orange-600 font-medium">Current Amount</p>
                      <p className="text-2xl font-bold text-orange-700">
                        ₹{qrSettings.autoQrAmount.toString()}
                      </p>
                    </div>
                  )}

                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={autoAmount}
                      onChange={(e) => setAutoAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>

                  {amountError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{amountError}</span>
                    </div>
                  )}
                  {amountSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Amount saved successfully!</span>
                    </div>
                  )}

                  <button
                    onClick={handleSaveAmount}
                    disabled={setAutoAmountMutation.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {setAutoAmountMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Amount
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
