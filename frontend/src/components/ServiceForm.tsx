import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubmitOrder } from '../hooks/useQueries';

const SERVICES = [
  { id: 'pan_card', name: 'PAN Card', icon: '🪪', amount: 150 },
  { id: 'aadhar_update', name: 'Aadhar Update', icon: '📋', amount: 100 },
  { id: 'passport', name: 'Passport', icon: '📘', amount: 500 },
  { id: 'driving_license', name: 'Driving License', icon: '🚗', amount: 300 },
  { id: 'income_certificate', name: 'Income Certificate', icon: '📄', amount: 200 },
  { id: 'caste_certificate', name: 'Caste Certificate', icon: '📜', amount: 200 },
  { id: 'domicile', name: 'Domicile Certificate', icon: '🏠', amount: 200 },
  { id: 'voter_id', name: 'Voter ID', icon: '🗳️', amount: 100 },
  { id: 'ration_card', name: 'Ration Card', icon: '🍚', amount: 150 },
  { id: 'birth_certificate', name: 'Birth Certificate', icon: '👶', amount: 150 },
  { id: 'printing', name: 'Printing / Xerox', icon: '🖨️', amount: 50 },
  { id: 'other', name: 'Other Service', icon: '⚙️', amount: 0 },
];

interface ServiceFormProps {
  serviceName?: string; // optional pre-selected service name
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

interface SuccessScreenProps {
  orderId: string;
  onTrack: () => void;
}

function SuccessScreen({ orderId, onTrack }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
      <p className="text-gray-500 mb-4">Your application has been received successfully.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-6 py-4 mb-6">
        <p className="text-xs text-orange-600 font-medium mb-1">Your Order ID</p>
        <p className="text-3xl font-bold text-orange-600">#{orderId}</p>
        <p className="text-xs text-orange-500 mt-1">Save this for tracking</p>
      </div>
      <button
        onClick={onTrack}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Track My Order
      </button>
    </div>
  );
}

export default function ServiceForm({ serviceName, onSuccess, onBack }: ServiceFormProps) {
  const { customerSession } = useAuth();
  const submitOrder = useSubmitOrder();

  // If a serviceName was passed in, try to find the matching service id
  const preselectedId = serviceName
    ? (SERVICES.find(s => s.name.toLowerCase() === serviceName.toLowerCase())?.id || 'other')
    : '';

  const [selectedService, setSelectedService] = useState(preselectedId);
  const [name, setName] = useState(customerSession?.name || '');
  const [mobile, setMobile] = useState(customerSession?.mobile || '');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const selectedServiceData = SERVICES.find(s => s.id === selectedService);
  const effectiveServiceName = selectedServiceData?.name || serviceName || selectedService;
  const amount = selectedServiceData?.id === 'other' && customAmount
    ? parseInt(customAmount, 10)
    : (selectedServiceData?.amount || 0);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedService) { setError('Please select a service.'); return; }
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!mobile.trim() || mobile.length < 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    if (!address.trim()) { setError('Please enter your address.'); return; }
    if (!customerSession?.mobile) { setError('Session expired. Please login again.'); return; }

    try {
      const photoBase64 = photoFile ? await fileToBase64(photoFile) : '';
      const documentBase64 = documentFile ? await fileToBase64(documentFile) : '';

      const orderId = await submitOrder.mutateAsync({
        customerId: customerSession.mobile,
        serviceName: effectiveServiceName,
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        photoDataBase64: photoBase64,
        documentDataBase64: documentBase64,
        amount: BigInt(isNaN(amount) ? 0 : amount),
      });

      const orderIdStr = orderId.toString();
      setSubmittedOrderId(orderIdStr);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Customer does not exist')) {
        setError('Account not found. Please login again.');
      } else if (msg.includes('not available')) {
        setError('Service is starting up. Please wait a moment and try again.');
      } else {
        setError('Submission failed. Please check your connection and try again.');
      }
    }
  };

  if (submittedOrderId) {
    return (
      <SuccessScreen
        orderId={submittedOrderId}
        onTrack={() => onSuccess(submittedOrderId)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-6">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Apply for Service</h1>
        <p className="text-orange-100 text-sm">Fill in your details below</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Service Selection */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">Select Service *</h2>
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service.id)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                  selectedService === service.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 bg-gray-50 hover:border-orange-200'
                }`}
              >
                <span className="text-xl mb-1">{service.icon}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{service.name}</span>
                {service.amount > 0 && (
                  <span className="text-xs text-orange-500 font-semibold mt-0.5">₹{service.amount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-gray-800 text-sm">Personal Details</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Number *</label>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your full address"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          {selectedService === 'other' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service Amount (₹)</label>
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-gray-800 text-sm">Attachments (Optional)</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {photoFile && (
              <p className="text-xs text-green-600 mt-1">✓ {photoFile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Document</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setDocumentFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {documentFile && (
              <p className="text-xs text-green-600 mt-1">✓ {documentFile.name}</p>
            )}
          </div>
        </div>

        {/* Amount Summary */}
        {amount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Service Fee</span>
              <span className="text-lg font-bold text-orange-600">₹{amount}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitOrder.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-lg"
        >
          {submitOrder.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Submitting...
            </span>
          ) : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
