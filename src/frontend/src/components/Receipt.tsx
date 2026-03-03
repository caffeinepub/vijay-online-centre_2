import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Phone,
  Printer,
  Truck,
  User,
} from "lucide-react";
import React from "react";
import { useGetOrderById } from "../hooks/useQueries";

interface ReceiptProps {
  orderId: string;
  onBack?: () => void;
}

const STATUS_STEPS = [
  { key: "orderPlaced", label: "Order Placed", labelHindi: "ऑर्डर दर्ज" },
  { key: "inProcess", label: "In Process", labelHindi: "प्रक्रिया में" },
  { key: "readyForPickup", label: "Ready for Pickup", labelHindi: "तैयार है" },
  { key: "completed", label: "Completed", labelHindi: "पूर्ण" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Order Placed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "In Process":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Ready for Pickup":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "Completed":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function formatTimestamp(ts: bigint | undefined): string {
  if (!ts || ts === BigInt(0)) return "";
  const num = Number(ts);
  if (num < 1000000000000) return "";
  return new Date(num).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Receipt({ orderId, onBack }: ReceiptProps) {
  const orderIdBigInt = orderId ? BigInt(orderId) : null;
  const { data: order, isLoading, error } = useGetOrderById(orderIdBigInt);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading receipt...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load receipt.</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(
    (s) => s.label === order.currentStatus,
  );

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
          <h1 className="text-lg font-bold text-foreground">Receipt / रसीद</h1>
          <p className="text-xs text-muted-foreground">Order #{orderId}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Print receipt"
        >
          <Printer className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Shop Header */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 text-center">
            <h2 className="text-xl font-bold">Vijay Computer Center</h2>
            <p className="text-sm opacity-90">विजय कंप्यूटर सेंटर</p>
            <p className="text-xs opacity-75 mt-1">
              Government Services & Documentation
            </p>
          </CardContent>
        </Card>

        {/* Tracking ID */}
        <div className="bg-primary/10 border-2 border-primary rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            Tracking ID / ट्रैकिंग आईडी
          </p>
          <p className="text-2xl font-bold text-primary font-mono">
            {order.trackingId}
          </p>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={`text-sm px-4 py-1.5 ${getStatusColor(order.currentStatus)}`}
          >
            {order.currentStatus}
          </Badge>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Service</span>
              <span className="text-sm font-medium">{order.serviceName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" /> Name
              </span>
              <span className="text-sm font-medium">{order.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> Mobile
              </span>
              <span className="text-sm font-medium">{order.mobile}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address
              </span>
              <span className="text-sm font-medium text-right max-w-[60%]">
                {order.address}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> Amount
              </span>
              <span className="text-base font-bold text-primary">
                {order.amount > BigInt(0)
                  ? `₹${order.amount.toString()}`
                  : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, index) => {
                const historyKey = step.key as keyof typeof order.statusHistory;
                const timestamp = order.statusHistory[historyKey];
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const timeStr = formatTimestamp(timestamp);

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.labelHindi}
                      </p>
                      {timeStr && (
                        <p className="text-xs text-primary mt-0.5">{timeStr}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
