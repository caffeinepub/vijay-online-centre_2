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
  Eye,
  FileUp,
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
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ServiceOrder } from "../backend";
import {
  useGetAllOrdersPublic,
  useUpdateOrderAmount,
  useUpdateOrderStatus,
  useUploadOrderReceipt,
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

function getPaymentStatusStyle(paymentStatus: string) {
  if (paymentStatus === "Paid") {
    return "bg-green-100 text-green-800 border-green-300";
  }
  return "bg-orange-100 text-orange-800 border-orange-300";
}

// ── Fullscreen Image Preview ──────────────────────────────────────────────────

function FullscreenPreview({
  src,
  onClose,
  isPdf,
}: {
  src: string;
  onClose: () => void;
  isPdf?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      data-ocid="admin.preview.modal"
    >
      {/* Backdrop — close on click */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
        aria-label="Close preview"
        style={{ background: "transparent" }}
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors"
        style={{ background: "rgba(255,255,255,0.15)" }}
        data-ocid="admin.preview.close_button"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      {isPdf ? (
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-white text-sm">PDF Document</p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: "oklch(0.78 0.12 85)",
              color: "oklch(0.14 0.04 240)",
            }}
          >
            Open PDF
          </a>
        </div>
      ) : (
        <img
          src={src}
          alt="Document preview"
          className="relative z-10 max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        />
      )}
    </div>
  );
}

// ── Amount Editor ─────────────────────────────────────────────────────────────

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
          data-ocid="admin.amount.input"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
          data-ocid="admin.amount.save_button"
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
          data-ocid="admin.amount.cancel_button"
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
        data-ocid="admin.amount.edit_button"
      >
        <Edit2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Receipt Uploader ──────────────────────────────────────────────────────────

function ReceiptUploader({ order }: { order: ServiceOrder }) {
  const uploadReceiptMutation = useUploadOrderReceipt();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadErr("");
    setUploadDone(false);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      await uploadReceiptMutation.mutateAsync({
        orderId: order.orderId,
        receiptUrl: dataUrl,
      });
      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadErr(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Upload Receipt:
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          data-ocid="admin.receipt.upload_button"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <FileUp className="w-3 h-3" />
          )}
          {uploading ? "Uploading..." : "Select File"}
        </button>

        {order.receiptUrl && order.receiptUrl !== "" && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Receipt saved
          </span>
        )}

        {uploadDone && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Uploaded!
          </span>
        )}
      </div>

      {uploadErr && (
        <p className="text-xs text-destructive mt-1">{uploadErr}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: ServiceOrder;
  onStatusUpdate: (orderId: bigint, status: string) => Promise<void>;
  onAmountUpdate: (orderId: bigint, amount: bigint) => Promise<void>;
  index: number;
}

function OrderCard({
  order,
  onStatusUpdate,
  onAmountUpdate,
  index,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewIsPdf, setPreviewIsPdf] = useState(false);

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

  const openPreview = (data: string, isPdf = false) => {
    if (!data) return;
    const src = data.startsWith("data:")
      ? data
      : isPdf
        ? `data:application/pdf;base64,${data}`
        : `data:image/jpeg;base64,${data}`;
    setPreviewSrc(src);
    setPreviewIsPdf(isPdf);
  };

  /** Parse a stored field — may be a JSON array of base64 strings or a plain string */
  const parseFileField = (raw: string): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      // not JSON — treat as plain base64/data-url
    }
    return [raw];
  };

  const photoItems = parseFileField(order.photoDataBase64);
  const docItems = parseFileField(order.documentDataBase64);

  return (
    <>
      {previewSrc && (
        <FullscreenPreview
          src={previewSrc}
          onClose={() => setPreviewSrc(null)}
          isPdf={previewIsPdf}
        />
      )}
      <Card
        className="border border-border"
        data-ocid={`admin.orders.item.${index}`}
      >
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
                {/* Payment Status Badge */}
                <Badge
                  variant="outline"
                  className={`text-xs ${getPaymentStatusStyle(order.paymentStatus || "Pending")}`}
                >
                  {order.paymentStatus || "Pending"}
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
              data-ocid={`admin.orders.toggle.${index}`}
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

          {/* Document preview icons (always visible) — supports array and plain string */}
          {(photoItems.length > 0 || docItems.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {photoItems.map((item, pIdx) => (
                <button
                  key={item.slice(-20)}
                  type="button"
                  onClick={() => openPreview(item, false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                  title={`View photo ${pIdx + 1}`}
                  data-ocid={`admin.orders.photo.button.${index}`}
                >
                  <Eye className="w-3 h-3 text-primary" />
                  {photoItems.length > 1 ? `Photo ${pIdx + 1}` : "Photo"}
                </button>
              ))}
              {docItems.map((item, dIdx) => (
                <button
                  key={item.slice(-20)}
                  type="button"
                  onClick={() => openPreview(item, item.includes("JVBERi"))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                  title={`View document ${dIdx + 1}`}
                  data-ocid={`admin.orders.doc.button.${index}`}
                >
                  <Eye className="w-3 h-3 text-primary" />
                  {docItems.length > 1 ? `Doc ${dIdx + 1}` : "Document"}
                </button>
              ))}
            </div>
          )}

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
                      disabled={
                        updatingStatus || order.currentStatus === status
                      }
                      className={`text-xs px-2 py-1.5 rounded-lg border transition-all font-medium ${
                        order.currentStatus === status
                          ? `${getStatusColor(status)} cursor-default`
                          : "border-border hover:border-primary hover:bg-primary/5 text-muted-foreground"
                      } disabled:opacity-50`}
                      data-ocid={`admin.status.button.${index}`}
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

              {/* Accept / Reject shortcuts */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("In Process")}
                  disabled={
                    updatingStatus || order.currentStatus === "In Process"
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 transition-colors disabled:opacity-50"
                  data-ocid={`admin.orders.accept.button.${index}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("Order Placed")}
                  disabled={updatingStatus}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors disabled:opacity-50"
                  data-ocid={`admin.orders.reject.button.${index}`}
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>

              {/* Receipt uploader */}
              <ReceiptUploader order={order} />
            </div>
          )}
        </CardContent>
      </Card>
    </>
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
  } = useGetAllOrdersPublic();
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
              data-ocid="admin.dashboard.button"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            {onNavigateQR && (
              <button
                type="button"
                onClick={onNavigateQR}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="QR Management"
                data-ocid="admin.qr.button"
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
          <TabsList className="w-full" data-ocid="admin.orders.tab">
            <TabsTrigger
              value="all"
              className="flex-1"
              data-ocid="admin.orders.all.tab"
            >
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="flex-1"
              data-ocid="admin.orders.active.tab"
            >
              Active ({stats.placed + stats.inProcess + stats.ready})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1"
              data-ocid="admin.orders.completed.tab"
            >
              Done ({stats.completed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.orders.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading orders...
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.orders.empty_state"
              >
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order, idx) => (
                <OrderCard
                  key={order.orderId.toString()}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onAmountUpdate={handleAmountUpdate}
                  index={idx + 1}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
