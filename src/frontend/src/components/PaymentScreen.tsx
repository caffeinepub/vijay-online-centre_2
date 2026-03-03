import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  Loader2,
  QrCode,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useGetQRSettings } from "../hooks/useQueries";

interface PaymentScreenProps {
  orderId?: string;
  serviceName?: string;
  onBack?: () => void;
  amount?: bigint;
  customerName?: string;
  onPaymentDone?: () => void;
}

export default function PaymentScreen({
  orderId,
  serviceName,
  onBack,
  amount,
  customerName,
  onPaymentDone,
}: PaymentScreenProps) {
  const { data: qrSettings, isLoading: qrLoading } = useGetQRSettings();
  const permQRBase64 = qrSettings?.permanentQrKey ?? "";
  const adminSetPrice = qrSettings
    ? qrSettings.autoQrAmount > 0n || qrSettings.permanentQrKey !== ""
    : false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);

  const displayAmount = amount ? Number(amount) : 0;
  const upiId = "vijayservices@upi";

  // Generate canvas QR fallback when no permanent QR is set
  useEffect(() => {
    if (permQRBase64 || qrLoading) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const size = 200;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Draw corner finder patterns
      const drawFinderPattern = (x: number, y: number) => {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(x, y, 49, 49);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 7, y + 7, 35, 35);
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(x + 14, y + 14, 21, 21);
      };

      drawFinderPattern(10, 10);
      drawFinderPattern(141, 10);
      drawFinderPattern(10, 141);

      // Draw data dots pattern
      const dots: [number, number][] = [
        [70, 10],
        [80, 10],
        [90, 10],
        [100, 10],
        [110, 10],
        [70, 20],
        [90, 20],
        [110, 20],
        [70, 30],
        [80, 30],
        [90, 30],
        [100, 30],
        [110, 30],
        [70, 40],
        [90, 40],
        [110, 40],
        [70, 50],
        [80, 50],
        [100, 50],
        [110, 50],
        [10, 70],
        [30, 70],
        [50, 70],
        [70, 70],
        [90, 70],
        [110, 70],
        [130, 70],
        [150, 70],
        [170, 70],
        [20, 80],
        [40, 80],
        [60, 80],
        [80, 80],
        [100, 80],
        [120, 80],
        [140, 80],
        [160, 80],
        [180, 80],
        [10, 90],
        [30, 90],
        [50, 90],
        [70, 90],
        [90, 90],
        [110, 90],
        [130, 90],
        [150, 90],
        [170, 90],
        [141, 70],
        [151, 70],
        [161, 70],
        [171, 70],
        [181, 70],
        [141, 80],
        [161, 80],
        [181, 80],
        [141, 90],
        [151, 90],
        [161, 90],
        [171, 90],
        [181, 90],
        [141, 100],
        [161, 100],
        [141, 110],
        [151, 110],
        [171, 110],
        [181, 110],
        [10, 110],
        [20, 110],
        [40, 110],
        [60, 110],
        [80, 110],
        [100, 110],
        [10, 120],
        [30, 120],
        [50, 120],
        [70, 120],
        [90, 120],
        [110, 120],
        [10, 130],
        [20, 130],
        [40, 130],
        [60, 130],
        [80, 130],
        [100, 130],
        [10, 150],
        [30, 150],
        [50, 150],
        [70, 150],
        [90, 150],
        [110, 150],
        [130, 150],
        [150, 150],
        [170, 150],
        [20, 160],
        [40, 160],
        [60, 160],
        [80, 160],
        [100, 160],
        [120, 160],
        [140, 160],
        [160, 160],
        [180, 160],
        [10, 170],
        [30, 170],
        [50, 170],
        [70, 170],
        [90, 170],
        [110, 170],
        [130, 170],
        [150, 170],
        [170, 170],
        [10, 180],
        [30, 180],
        [50, 180],
        [70, 180],
        [90, 180],
        [110, 180],
        [130, 180],
        [150, 180],
        [170, 180],
      ];

      ctx.fillStyle = "#1a1a2e";
      for (const [x, y] of dots) {
        ctx.fillRect(x, y, 8, 8);
      }

      setQrError(false);
    } catch {
      setQrError(true);
    }
  }, [permQRBase64, qrLoading]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — clipboard not available
    }
  };

  const getQRImageSrc = (): string | null => {
    if (!permQRBase64) return null;
    if (permQRBase64.startsWith("data:")) return permQRBase64;
    return `data:image/png;base64,${permQRBase64}`;
  };

  const qrImageSrc = getQRImageSrc();

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.14 0.04 240)" }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.14 0.04 240)",
          borderBottom: "1px solid oklch(0.22 0.06 240)",
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl mr-3 transition-all active:scale-95"
            style={{ background: "oklch(0.22 0.06 240)" }}
          >
            <ArrowLeft size={20} style={{ color: "oklch(0.82 0.012 240)" }} />
          </button>
        )}
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.97 0.005 240)" }}
          >
            Payment
          </h1>
          {orderId && (
            <p className="text-xs" style={{ color: "oklch(0.62 0.015 240)" }}>
              Order #{orderId}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 pb-24">
        {/* Service / Amount info */}
        {(serviceName || displayAmount > 0 || customerName) && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(0.18 0.05 240)",
              border: "1px solid oklch(0.28 0.07 240)",
            }}
          >
            {serviceName && (
              <>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "oklch(0.62 0.015 240)" }}
                >
                  SERVICE
                </p>
                <p
                  className="text-base font-bold"
                  style={{ color: "oklch(0.97 0.005 240)" }}
                >
                  {serviceName}
                </p>
              </>
            )}
            {customerName && (
              <p
                className="text-sm mt-1"
                style={{ color: "oklch(0.72 0.015 240)" }}
              >
                for {customerName}
              </p>
            )}
            {displayAmount > 0 && (
              <p
                className="text-2xl font-bold mt-2"
                style={{ color: "oklch(0.78 0.12 85)" }}
              >
                ₹{displayAmount.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}

        {/* QR Code */}
        {!adminSetPrice && !qrLoading ? (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: "oklch(0.18 0.05 240)",
              border: "1px solid oklch(0.28 0.07 240)",
            }}
          >
            <QrCode
              size={32}
              style={{ color: "oklch(0.62 0.015 240)", margin: "0 auto 12px" }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.82 0.012 240)" }}
            >
              Admin ne abhi payment amount set nahi ki hai.
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              Please wait — Admin is setting the price for your order.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "oklch(0.18 0.05 240)",
              border: "1px solid oklch(0.28 0.07 240)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <QrCode size={20} style={{ color: "oklch(0.78 0.12 85)" }} />
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.97 0.005 240)" }}
              >
                Scan QR to Pay
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {qrLoading ? (
                <div
                  className="w-48 h-48 flex items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.22 0.06 240)" }}
                >
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: "oklch(0.78 0.12 85)" }}
                  />
                </div>
              ) : qrImageSrc ? (
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <img
                    src={qrImageSrc}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                    onError={() => setQrError(true)}
                  />
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  {qrError ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <p className="text-xs text-gray-500 text-center">
                        QR not available
                      </p>
                    </div>
                  ) : (
                    <canvas
                      ref={canvasRef}
                      className="w-48 h-48"
                      style={{ imageRendering: "pixelated" }}
                    />
                  )}
                </div>
              )}

              <p
                className="text-xs text-center"
                style={{ color: "oklch(0.62 0.015 240)" }}
              >
                Open any UPI app and scan this QR code
              </p>
            </div>
          </div>
        )}

        {/* UPI ID */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "oklch(0.18 0.05 240)",
            border: "1px solid oklch(0.28 0.07 240)",
          }}
        >
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "oklch(0.62 0.015 240)" }}
          >
            UPI ID
          </p>
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "oklch(0.22 0.06 240)" }}
          >
            <span
              className="flex-1 font-mono text-sm"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {upiId}
            </span>
            <button
              type="button"
              onClick={handleCopyUPI}
              className="shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ background: "oklch(0.28 0.07 240)" }}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy
                  className="w-4 h-4"
                  style={{ color: "oklch(0.78 0.12 85)" }}
                />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-400 mt-2 text-center">
              UPI ID copied!
            </p>
          )}
        </div>

        {/* Instructions */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "oklch(0.18 0.05 240)",
            border: "1px solid oklch(0.28 0.07 240)",
          }}
        >
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "oklch(0.97 0.005 240)" }}
          >
            Payment Instructions
          </p>
          <ol className="space-y-2">
            {[
              "1. Open Google Pay, PhonePe, Paytm, or any UPI app",
              "2. Scan the QR code or enter the UPI ID",
              displayAmount > 0
                ? `3. Enter amount: ₹${displayAmount.toLocaleString("en-IN")}`
                : "3. Enter the payment amount",
              "4. Complete the payment",
              "5. Take a screenshot of the confirmation",
              "6. Share it on WhatsApp for faster processing",
            ].map((step) => (
              <p
                key={step}
                className="text-xs"
                style={{ color: "oklch(0.72 0.015 240)" }}
              >
                {step}
              </p>
            ))}
          </ol>
        </div>

        {/* Done button */}
        {onPaymentDone && (
          <button
            type="button"
            onClick={onPaymentDone}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90"
            style={{
              background: "oklch(0.78 0.12 85)",
              color: "oklch(0.14 0.04 240)",
            }}
          >
            Payment Done — Track My Order
          </button>
        )}
      </div>
    </div>
  );
}
