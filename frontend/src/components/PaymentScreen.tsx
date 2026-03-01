import React, { useEffect, useRef } from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useGetQRSettings } from '../hooks/useQueries';

interface PaymentScreenProps {
  orderId: string;
  serviceName: string;
  onBack: () => void;
}

function generateQRDataURL(text: string, size: number): string {
  // Simple QR code placeholder using canvas with text
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Draw a simple pattern to represent QR
  ctx.fillStyle = '#000000';
  const cellSize = size / 25;

  // Draw border squares (finder patterns)
  const drawFinderPattern = (x: number, y: number) => {
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(18, 0);
  drawFinderPattern(0, 18);

  // Draw some random data cells
  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      if ((i < 9 && j < 9) || (i > 16 && j < 9) || (i < 9 && j > 16)) continue;
      const val = (seed * (i + 1) * (j + 1) * 7919) % 100;
      if (val > 50) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  // Center text
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${cellSize * 1.2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  return canvas.toDataURL();
}

export default function PaymentScreen({ orderId, serviceName, onBack }: PaymentScreenProps) {
  const { data: qrSettings, isLoading } = useGetQRSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasPermQR = qrSettings && qrSettings.permanentQrKey && qrSettings.permanentQrKey.length > 0;
  const autoAmount = qrSettings ? Number(qrSettings.autoQrAmount) : 0;

  useEffect(() => {
    if (!canvasRef.current || hasPermQR) return;
    const amount = autoAmount > 0 ? autoAmount : 0;
    const upiString = `upi://pay?pa=vijayonlinecentre@upi&pn=Vijay+Online+Centre&am=${amount}&cu=INR&tn=Order+${orderId}`;
    const dataUrl = generateQRDataURL(upiString, 200);
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
    img.src = dataUrl;
  }, [qrSettings, orderId, hasPermQR, autoAmount]);

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
          <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>Payment</h1>
          <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>Order #{orderId}</p>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {/* Service Info */}
        <div className="rounded-2xl p-4 mb-6"
          style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'oklch(0.62 0.015 240)' }}>SERVICE</p>
          <p className="text-base font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>{serviceName}</p>
          {autoAmount > 0 && (
            <p className="text-lg font-bold mt-1" style={{ color: 'oklch(0.78 0.12 85)' }}>
              ₹{autoAmount}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'oklch(0.78 0.12 85)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* QR Code Display */}
            <div className="rounded-2xl p-6 mb-6 flex flex-col items-center"
              style={{ background: 'oklch(0.97 0.005 240)', border: '2px solid oklch(0.78 0.12 85 / 40%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <QrCode size={20} style={{ color: 'oklch(0.14 0.04 240)' }} />
                <p className="text-sm font-bold" style={{ color: 'oklch(0.14 0.04 240)' }}>
                  {hasPermQR ? 'Scan to Pay (UPI)' : 'UPI Payment QR'}
                </p>
              </div>

              {hasPermQR ? (
                <img
                  src={qrSettings.permanentQrKey}
                  alt="Payment QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/generated/vijay-logo.dim_512x512.png';
                  }}
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={200}
                  className="w-48 h-48"
                />
              )}

              <p className="text-xs mt-3 text-center" style={{ color: 'oklch(0.35 0.08 240)' }}>
                ICICI Bank · Vijay Online Centre
              </p>
            </div>

            {/* Instructions */}
            <div className="w-full rounded-2xl p-4 mb-4"
              style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Payment Instructions
              </p>
              <div className="space-y-2">
                {[
                  '1. Open any UPI app (PhonePe, GPay, Paytm)',
                  '2. Scan the QR code above',
                  '3. Enter the amount if not pre-filled',
                  '4. Complete the payment',
                  '5. Wait for admin confirmation',
                ].map((step) => (
                  <p key={step} className="text-xs" style={{ color: 'oklch(0.72 0.015 240)' }}>{step}</p>
                ))}
              </div>
            </div>

            <div className="w-full rounded-2xl p-4"
              style={{ background: 'oklch(0.78 0.12 85 / 10%)', border: '1px solid oklch(0.78 0.12 85 / 30%)' }}>
              <p className="text-xs text-center" style={{ color: 'oklch(0.78 0.12 85)' }}>
                ⏳ After payment, admin will confirm and update your order status automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
