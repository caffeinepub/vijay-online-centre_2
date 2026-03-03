import {
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  IndianRupee,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import React from "react";
import type { ServiceOrder } from "../backend";
import { useGetOrdersByCustomerPublic } from "../hooks/useQueries";

interface MyOrdersProps {
  customerId: string;
  onTrackOrder?: (trackingId: string) => void;
  onViewReceipt?: (orderId: string) => void;
  onPayNow?: (orderId: string, serviceName: string) => void;
}

function getStatusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case "Order Placed":
      return { bg: "oklch(0.6 0.15 200 / 15%)", color: "oklch(0.6 0.15 200)" };
    case "In Process":
      return { bg: "oklch(0.78 0.12 85 / 15%)", color: "oklch(0.78 0.12 85)" };
    case "Ready for Pickup":
      return {
        bg: "oklch(0.65 0.15 300 / 15%)",
        color: "oklch(0.65 0.15 300)",
      };
    case "Completed":
      return { bg: "oklch(0.5 0.15 145 / 15%)", color: "oklch(0.6 0.15 145)" };
    default:
      return {
        bg: "oklch(0.35 0.08 240 / 30%)",
        color: "oklch(0.72 0.015 240)",
      };
  }
}

function getPaymentStatusStyle(paymentStatus: string): {
  bg: string;
  color: string;
} {
  if (paymentStatus === "Paid") {
    return {
      bg: "oklch(0.5 0.15 145 / 15%)",
      color: "oklch(0.5 0.15 145)",
    };
  }
  return {
    bg: "oklch(0.78 0.12 85 / 15%)",
    color: "oklch(0.72 0.12 60)",
  };
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Order Placed":
      return <Package size={12} />;
    case "In Process":
      return <Clock size={12} />;
    case "Ready for Pickup":
      return <Truck size={12} />;
    case "Completed":
      return <CheckCircle size={12} />;
    default:
      return <Package size={12} />;
  }
}

function OrderCard({
  order,
  onTrackOrder,
  onViewReceipt,
  onPayNow,
  index,
}: {
  order: ServiceOrder;
  onTrackOrder?: (trackingId: string) => void;
  onViewReceipt?: (orderId: string) => void;
  onPayNow?: (orderId: string, serviceName: string) => void;
  index: number;
}) {
  const [copied, setCopied] = React.useState(false);
  const statusStyle = getStatusStyle(order.currentStatus);
  const paymentStyle = getPaymentStatusStyle(order.paymentStatus || "Pending");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.trackingId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (ts: bigint) => {
    const num = Number(ts);
    if (num < 1000000000000) return "";
    return new Date(num).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const hasReceipt = order.receiptUrl && order.receiptUrl !== "";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.18 0.05 240)",
        border: "1px solid oklch(0.28 0.07 240)",
      }}
      data-ocid={`orders.item.${index}`}
    >
      <div className="p-4">
        {/* Service & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-sm truncate"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {order.serviceName}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              Order #{order.orderId.toString()}
              {formatDate(order.timestamp) &&
                ` • ${formatDate(order.timestamp)}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              {getStatusIcon(order.currentStatus)}
              {order.currentStatus}
            </span>
            {/* Payment Status Badge */}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: paymentStyle.bg, color: paymentStyle.color }}
            >
              <CreditCard size={10} />
              {order.paymentStatus || "Pending"}
            </span>
          </div>
        </div>

        {/* Tracking ID */}
        <div
          className="rounded-lg px-3 py-2 mb-3 flex items-center justify-between"
          style={{
            background: "oklch(0.78 0.12 85 / 10%)",
            border: "1px solid oklch(0.78 0.12 85 / 25%)",
          }}
        >
          <div>
            <p className="text-xs" style={{ color: "oklch(0.62 0.015 240)" }}>
              Tracking ID
            </p>
            <p
              className="text-sm font-bold font-mono"
              style={{ color: "oklch(0.78 0.12 85)" }}
            >
              {order.trackingId}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: "oklch(0.78 0.12 85 / 15%)" }}
            title="Copy tracking ID"
            data-ocid={`orders.copy.button.${index}`}
          >
            {copied ? (
              <CheckCircle
                className="w-4 h-4"
                style={{ color: "oklch(0.6 0.15 145)" }}
              />
            ) : (
              <Copy
                className="w-4 h-4"
                style={{ color: "oklch(0.78 0.12 85)" }}
              />
            )}
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee
            className="w-4 h-4"
            style={{ color: "oklch(0.62 0.015 240)" }}
          />
          {order.amount > BigInt(0) ? (
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.78 0.12 85)" }}
            >
              ₹{order.amount.toString()}
            </span>
          ) : (
            <span
              className="text-xs italic"
              style={{ color: "oklch(0.55 0.015 240)" }}
            >
              Amount pending (admin will set)
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {onTrackOrder && (
            <button
              type="button"
              onClick={() => onTrackOrder(order.trackingId)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
              style={{
                background: "oklch(0.78 0.12 85)",
                color: "oklch(0.14 0.04 240)",
              }}
              data-ocid={`orders.track.button.${index}`}
            >
              <Package size={12} />
              Track Order
            </button>
          )}
          {/* Pay Now button: only show if payment is still pending */}
          {onPayNow && order.paymentStatus !== "Paid" && (
            <button
              type="button"
              onClick={() =>
                onPayNow(order.orderId.toString(), order.serviceName)
              }
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
              style={{
                background: "oklch(0.55 0.18 145)",
                color: "oklch(0.97 0.005 240)",
              }}
              data-ocid={`orders.pay.button.${index}`}
            >
              <CreditCard size={12} />
              Pay Now
            </button>
          )}
          {/* View Receipt: only show if receiptUrl exists */}
          {onViewReceipt && hasReceipt && (
            <button
              type="button"
              onClick={() => onViewReceipt(order.orderId.toString())}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{
                background: "oklch(0.22 0.06 240)",
                color: "oklch(0.82 0.012 240)",
              }}
              data-ocid={`orders.receipt.button.${index}`}
            >
              View Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyOrders({
  customerId,
  onTrackOrder,
  onViewReceipt,
  onPayNow,
}: MyOrdersProps) {
  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetOrdersByCustomerPublic(customerId);

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.orderId) - Number(a.orderId),
  );

  return (
    <div className="min-h-full" style={{ background: "oklch(0.14 0.04 240)" }}>
      {/* Header */}
      <div
        className="px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.14 0.04 240)",
          borderBottom: "1px solid oklch(0.22 0.06 240)",
        }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: "oklch(0.97 0.005 240)" }}
        >
          My Orders
        </h1>
        <p className="text-xs mt-1" style={{ color: "oklch(0.62 0.015 240)" }}>
          मेरे आवेदन — {sortedOrders.length} orders
        </p>
      </div>

      <div className="px-4 py-4 pb-24 space-y-3">
        {isLoading && (
          <div
            className="flex items-center justify-center py-12 gap-3"
            data-ocid="orders.loading_state"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(0.78 0.12 85)" }}
            />
            <p className="text-sm" style={{ color: "oklch(0.62 0.015 240)" }}>
              Loading orders...
            </p>
          </div>
        )}

        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: "oklch(0.577 0.245 27.325 / 20%)",
              border: "1px solid oklch(0.577 0.245 27.325 / 40%)",
              color: "oklch(0.85 0.15 27)",
            }}
            data-ocid="orders.error_state"
          >
            Failed to load orders. Please try again.
          </div>
        )}

        {!isLoading && !error && sortedOrders.length === 0 && (
          <div
            className="flex flex-col items-center py-16 gap-3"
            data-ocid="orders.empty_state"
          >
            <Package size={48} style={{ color: "oklch(0.35 0.08 240)" }} />
            <p
              className="font-medium"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              No orders yet
            </p>
            <p
              className="text-sm text-center"
              style={{ color: "oklch(0.45 0.02 240)" }}
            >
              Apply for a service to see your orders here
            </p>
          </div>
        )}

        {sortedOrders.map((order: ServiceOrder, idx) => (
          <OrderCard
            key={order.orderId.toString()}
            order={order}
            onTrackOrder={onTrackOrder}
            onViewReceipt={onViewReceipt}
            onPayNow={onPayNow}
            index={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
