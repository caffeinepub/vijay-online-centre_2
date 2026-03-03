import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Star,
  Truck,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { OrderStatus, ServiceOrder } from "../backend";
import { useGetOrderByTrackingId } from "../hooks/useQueries";

interface OrderTrackingProps {
  orderId?: string;
  onBack?: () => void;
  onViewReceipt?: (orderId: string) => void;
  initialTrackingId?: string;
}

const STATUS_STEPS = [
  {
    key: "orderPlaced",
    status: "Order Placed",
    label: "Order Placed",
    labelHindi: "ऑर्डर दर्ज हुआ",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
  },
  {
    key: "inProcess",
    status: "In Process",
    label: "In Process",
    labelHindi: "प्रक्रिया में है",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-500",
  },
  {
    key: "readyForPickup",
    status: "Ready for Pickup",
    label: "Ready for Pickup",
    labelHindi: "तैयार है",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-500",
  },
  {
    key: "completed",
    status: "Completed",
    label: "Completed",
    labelHindi: "पूर्ण हुआ",
    icon: Star,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
  },
];

function formatTimestamp(ts: bigint | undefined): string {
  if (!ts || ts === BigInt(0)) return "";
  // If timestamp is in milliseconds (13 digits), use directly
  // If it's a small number (counter-based from backend), show as N/A
  const num = Number(ts);
  if (num < 1000000000000) return ""; // too small to be a real timestamp
  return new Date(num).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackingTimeline({ order }: { order: ServiceOrder }) {
  const currentStatusIndex = STATUS_STEPS.findIndex(
    (s) => s.status === order.currentStatus,
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

      <div className="space-y-0">
        {STATUS_STEPS.map((step, index) => {
          const historyKey = step.key as keyof OrderStatus;
          const timestamp = order.statusHistory[historyKey];
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isFuture = index > currentStatusIndex;
          const Icon = step.icon;
          const timeStr = formatTimestamp(timestamp);

          return (
            <div
              key={step.key}
              className="relative flex items-start gap-4 pb-6"
            >
              {/* Icon circle */}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                  isCurrent
                    ? `${step.bgColor} ${step.borderColor} shadow-lg ring-4 ring-offset-2 ring-primary/20`
                    : isCompleted
                      ? `${step.bgColor} ${step.borderColor}`
                      : "bg-muted border-border"
                }`}
              >
                {isCompleted ? (
                  <Icon
                    className={`w-5 h-5 ${isFuture ? "text-muted-foreground" : step.color}`}
                  />
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-semibold text-sm ${
                      isFuture ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <Badge className="text-xs px-2 py-0 bg-primary text-primary-foreground">
                      Current
                    </Badge>
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isFuture
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.labelHindi}
                </p>
                {timeStr && (
                  <p className="text-xs text-primary font-medium mt-1">
                    🕐 {timeStr}
                  </p>
                )}
                {isFuture && (
                  <p className="text-xs text-muted-foreground/50 mt-1 italic">
                    Pending...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetails({
  order,
  onViewReceipt,
}: { order: ServiceOrder; onViewReceipt?: () => void }) {
  return (
    <div className="space-y-4">
      {/* Tracking ID Banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
          Tracking ID / ट्रैकिंग आईडी
        </p>
        <p className="text-xl font-bold text-primary font-mono">
          {order.trackingId}
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          className={`text-sm px-4 py-1.5 ${
            order.currentStatus === "Completed"
              ? "bg-green-100 text-green-800 border-green-300"
              : order.currentStatus === "Ready for Pickup"
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : order.currentStatus === "In Process"
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : "bg-blue-100 text-blue-800 border-blue-300"
          }`}
          variant="outline"
        >
          {order.currentStatus}
        </Badge>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Order Progress / ऑर्डर की स्थिति
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline order={order} />
        </CardContent>
      </Card>

      {/* Order Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Details / विवरण</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="text-sm font-medium">{order.serviceName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> Mobile
            </span>
            <span className="text-sm font-medium">{order.mobile}</span>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Address
            </span>
            <span className="text-sm font-medium text-right max-w-[60%]">
              {order.address}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Amount
            </span>
            <span className="text-sm font-bold text-primary">
              {order.amount > BigInt(0)
                ? `₹${order.amount.toString()}`
                : "Pending (Admin will set)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {onViewReceipt && (
        <Button variant="outline" onClick={onViewReceipt} className="w-full">
          View Receipt / रसीद देखें
        </Button>
      )}
    </div>
  );
}

export default function OrderTracking({
  orderId: _orderId,
  onBack,
  onViewReceipt,
  initialTrackingId,
}: OrderTrackingProps) {
  const [inputTrackingId, setInputTrackingId] = useState(
    initialTrackingId || "",
  );
  const [searchTrackingId, setSearchTrackingId] = useState(
    initialTrackingId || "",
  );

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderByTrackingId(searchTrackingId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrackingId(inputTrackingId.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Track Order</h1>
          <p className="text-xs text-muted-foreground">ऑर्डर ट्रैक करें</p>
        </div>
        {searchTrackingId && (
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={inputTrackingId}
            onChange={(e) => setInputTrackingId(e.target.value.toUpperCase())}
            placeholder="Enter Tracking ID (e.g. TRACK123)"
            className="flex-1 font-mono"
          />
          <Button type="submit" disabled={!inputTrackingId.trim()}>
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Loading */}
        {isLoading && searchTrackingId && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Fetching order details...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <p className="text-destructive text-sm">
              Failed to fetch order. Please try again.
            </p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && searchTrackingId && order === null && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Order Not Found
            </h3>
            <p className="text-muted-foreground text-sm">
              No order found with tracking ID:{" "}
              <strong>{searchTrackingId}</strong>
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              कृपया सही Tracking ID डालें
            </p>
          </div>
        )}

        {/* Order found */}
        {order && (
          <OrderDetails
            order={order}
            onViewReceipt={
              onViewReceipt
                ? () => onViewReceipt(order.orderId.toString())
                : undefined
            }
          />
        )}

        {/* Empty state */}
        {!searchTrackingId && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enter Tracking ID
            </h3>
            <p className="text-muted-foreground text-sm">
              Enter your Tracking ID above to see order status
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              ऊपर अपनी Tracking ID डालें
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
