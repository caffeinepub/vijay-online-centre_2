import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Phone,
  QrCode,
  RefreshCw,
  Save,
  Truck,
  User,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import type { ServiceOrder } from "../backend";
import {
  useGetAllOrders,
  useUpdateOrderAmount,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const STATUS_OPTIONS = [
  "Order Placed",
  "In Process",
  "Ready for Pickup",
  "Completed",
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

function getStatusIcon(status: string) {
  switch (status) {
    case "Order Placed":
      return <Package className="w-3 h-3" />;
    case "In Process":
      return <Clock className="w-3 h-3" />;
    case "Ready for Pickup":
      return <Truck className="w-3 h-3" />;
    case "Completed":
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Package className="w-3 h-3" />;
  }
}

interface AmountEditorProps {
  order: ServiceOrder;
  onSave: (orderId: bigint, amount: bigint) => Promise<void>;
}

function AmountEditor({ order, onSave }: AmountEditorProps) {
  const [editing, setEditing] = useState(false);
  const [amountInput, setAmountInput] = useState(order.amount.toString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const parsed = Number.parseInt(amountInput, 10);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await onSave(order.orderId, BigInt(parsed));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-muted-foreground">₹</span>
        <Input
          type="number"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="h-7 w-24 text-sm"
          min={0}
          autoFocus
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setAmountInput(order.amount.toString());
          }}
          className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-primary">
        {order.amount > BigInt(0) ? `₹${order.amount.toString()}` : "Not set"}
      </span>
      {saved && <CheckCircle className="w-4 h-4 text-green-600" />}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"
        title="Edit amount"
      >
        <Edit2 className="w-3 h-3" />
      </button>
    </div>
  );
}

interface OrderCardProps {
  order: ServiceOrder;
  onStatusUpdate: (orderId: bigint, status: string) => Promise<void>;
  onAmountUpdate: (orderId: bigint, amount: bigint) => Promise<void>;
}

function OrderCard({ order, onStatusUpdate, onAmountUpdate }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(order.orderId, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (ts: bigint) => {
    const num = Number(ts);
    if (num < 1000000000000) return "N/A";
    return new Date(num).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground text-sm">
                #{order.orderId.toString()}
              </span>
              <Badge
                variant="outline"
                className={`text-xs flex items-center gap-1 ${getStatusColor(order.currentStatus)}`}
              >
                {getStatusIcon(order.currentStatus)}
                {order.currentStatus}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground mt-1">
              {order.serviceName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Always visible: customer info */}
        <div className="grid grid-cols-1 gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {order.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-semibold text-primary">
              {order.mobile || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <AmountEditor order={order} onSave={onAmountUpdate} />
          </div>
        </div>

        {/* Tracking ID */}
        <div className="bg-muted rounded-lg px-3 py-1.5 mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tracking ID:</span>
          <span className="text-xs font-mono font-bold text-foreground">
            {order.trackingId}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">
                {order.address}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted: {formatDate(order.timestamp)}
            </div>

            {/* Status update */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Update Status:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updatingStatus || order.currentStatus === status}
                    className={`text-xs px-2 py-1.5 rounded-lg border transition-all font-medium ${
                      order.currentStatus === status
                        ? `${getStatusColor(status)} cursor-default`
                        : "border-border hover:border-primary hover:bg-primary/5 text-muted-foreground"
                    } disabled:opacity-50`}
                  >
                    {updatingStatus && order.currentStatus !== status ? (
                      <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                    ) : (
                      status
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {(order.photoDataBase64 || order.documentDataBase64) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Attachments:
                </p>
                <div className="flex gap-3 flex-wrap">
                  {order.photoDataBase64 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Photo:</p>
                      <button
                        type="button"
                        className="w-24 h-24 p-0 rounded-lg border border-border overflow-hidden"
                        onClick={() => {
                          const src = order.photoDataBase64.startsWith("data:")
                            ? order.photoDataBase64
                            : `data:image/jpeg;base64,${order.photoDataBase64}`;
                          window.open(src, "_blank");
                        }}
                      >
                        <img
                          src={
                            order.photoDataBase64.startsWith("data:")
                              ? order.photoDataBase64
                              : `data:image/jpeg;base64,${order.photoDataBase64}`
                          }
                          alt="Customer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </button>
                    </div>
                  )}
                  {order.documentDataBase64 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Document:</p>
                      {order.documentDataBase64.includes("JVBERi") ? (
                        <button
                          type="button"
                          onClick={() => {
                            const src = order.documentDataBase64.startsWith(
                              "data:",
                            )
                              ? order.documentDataBase64
                              : `data:application/pdf;base64,${order.documentDataBase64}`;
                            window.open(src, "_blank");
                          }}
                          className="text-xs text-primary underline"
                        >
                          View PDF
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="w-24 h-24 p-0 rounded-lg border border-border overflow-hidden"
                          onClick={() => {
                            const src = order.documentDataBase64.startsWith(
                              "data:",
                            )
                              ? order.documentDataBase64
                              : `data:image/jpeg;base64,${order.documentDataBase64}`;
                            window.open(src, "_blank");
                          }}
                        >
                          <img
                            src={
                              order.documentDataBase64.startsWith("data:")
                                ? order.documentDataBase64
                                : `data:image/jpeg;base64,${order.documentDataBase64}`
                            }
                            alt="Document"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AdminDashboardProps {
  onNavigateQR?: () => void;
  onBack?: () => void;
}

export default function AdminDashboard({
  onNavigateQR,
  onBack: _onBack,
}: AdminDashboardProps) {
  const {
    data: orders = [],
    isLoading,
    dataUpdatedAt,
    refetch,
  } = useGetAllOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateAmountMutation = useUpdateOrderAmount();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const handleStatusUpdate = async (orderId: bigint, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ orderId, newStatus });
  };

  const handleAmountUpdate = async (orderId: bigint, amount: bigint) => {
    await updateAmountMutation.mutateAsync({ orderId, amount });
  };

  const filterOrders = (tab: string) => {
    if (tab === "all") return orders;
    if (tab === "active")
      return orders.filter((o) => o.currentStatus !== "Completed");
    if (tab === "completed")
      return orders.filter((o) => o.currentStatus === "Completed");
    return orders;
  };

  const filteredOrders = filterOrders(activeTab);

  const stats = {
    total: orders.length,
    placed: orders.filter((o) => o.currentStatus === "Order Placed").length,
    inProcess: orders.filter((o) => o.currentStatus === "In Process").length,
    ready: orders.filter((o) => o.currentStatus === "Ready for Pickup").length,
    completed: orders.filter((o) => o.currentStatus === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Auto-refreshing every 5s
                {lastUpdated &&
                  ` • Updated ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            {onNavigateQR && (
              <button
                type="button"
                onClick={onNavigateQR}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="QR Management"
              >
                <QrCode className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">
                {stats.inProcess}
              </p>
              <p className="text-xs text-orange-600">In Process</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {stats.ready}
              </p>
              <p className="text-xs text-purple-600">Ready for Pickup</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {stats.completed}
              </p>
              <p className="text-xs text-green-600">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              Active ({stats.placed + stats.inProcess + stats.ready})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Done ({stats.completed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading orders...
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.orderId.toString()}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onAmountUpdate={handleAmountUpdate}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
