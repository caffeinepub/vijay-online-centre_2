import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle,
  Copy,
  FileText,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useSubmitOrder } from "../hooks/useQueries";

interface ServiceFormProps {
  serviceName: string;
  customerId: string;
  customerName: string;
  onBack: () => void;
  onTrackOrder: (trackingId: string) => void;
}

const SERVICES = [
  "Aadhar Card",
  "PAN Card",
  "Voter ID",
  "Driving License",
  "Passport",
  "Income Certificate",
  "Caste Certificate",
  "Domicile Certificate",
  "Birth Certificate",
  "Death Certificate",
  "Ration Card",
  "Other",
];

const MAX_FILES = 7;

export default function ServiceForm({
  serviceName,
  customerId,
  customerName,
  onBack,
  onTrackOrder,
}: ServiceFormProps) {
  const { isFetching: actorFetching } = useActor();
  const { mutateAsync: submitOrder } = useSubmitOrder();

  const [name, setName] = useState(customerName || "");
  const [mobile, setMobile] = useState(customerId || "");
  const [address, setAddress] = useState("");
  const [selectedService, setSelectedService] = useState(serviceName || "");

  // Multiple file states
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<"files" | "submit">("files");
  const [error, setError] = useState("");
  const [successTrackingId, setSuccessTrackingId] = useState("");
  const [copied, setCopied] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    const remaining = MAX_FILES - photoFiles.length;
    const toAdd = newFiles.slice(0, remaining);

    const newPreviews = await Promise.all(toAdd.map(readPreview));
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input so same files can be re-selected
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDocumentChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    const remaining = MAX_FILES - documentFiles.length;
    const toAdd = newFiles.slice(0, remaining);

    const newPreviews = await Promise.all(toAdd.map(readPreview));
    setDocumentFiles((prev) => [...prev, ...toAdd]);
    setDocumentPreviews((prev) => [...prev, ...newPreviews]);

    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeDocument = (idx: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== idx));
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(successTrackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("कृपया अपना नाम दर्ज करें।");
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setError("कृपया सही मोबाइल नंबर दर्ज करें।");
      return;
    }
    if (!address.trim()) {
      setError("कृपया अपना पता दर्ज करें।");
      return;
    }
    if (!selectedService) {
      setError("कृपया सेवा चुनें।");
      return;
    }

    setIsSubmitting(true);
    setSubmitStage("files");

    try {
      // Convert all photos to base64 array then stringify
      let photoDataBase64 = "";
      let documentDataBase64 = "";

      if (photoFiles.length > 0) {
        const base64Array = await Promise.all(photoFiles.map(fileToBase64));
        photoDataBase64 = JSON.stringify(base64Array);
      }

      if (documentFiles.length > 0) {
        const base64Array = await Promise.all(documentFiles.map(fileToBase64));
        documentDataBase64 = JSON.stringify(base64Array);
      }

      setSubmitStage("submit");

      const timestamp = BigInt(Date.now());

      const TIMEOUT_MS = 60000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out. Please try again.")),
          TIMEOUT_MS,
        ),
      );

      const orderId = await Promise.race([
        submitOrder({
          customerId: customerId || mobile,
          serviceName: selectedService,
          name: name.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          photoDataBase64,
          documentDataBase64,
          timestamp,
        }),
        timeoutPromise,
      ]);

      // Generate tracking ID from orderId (matches backend logic)
      const orderIdNum = Number(orderId);
      const suffix = (orderIdNum * 73) % 100;
      const trackingId = `TRACK${orderIdNum}${suffix}`;

      setSuccessTrackingId(trackingId);
    } catch (err: unknown) {
      console.error("Submit order error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Actor not available")) {
        setError("सिस्टम तैयार नहीं है। कृपया पेज रिफ्रेश करें और फिर से प्रयास करें।");
      } else {
        setError(`आवेदन जमा करने में त्रुटि: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (successTrackingId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">आवेदन सफल!</h2>
          <p className="text-muted-foreground mb-6">
            आपका आवेदन सफलतापूर्वक जमा हो गया है।
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">आपका ट्रैकिंग ID</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary tracking-wider">
                {successTrackingId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                title="Copy tracking ID"
              >
                <Copy className="w-5 h-5 text-primary" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">✓ कॉपी हो गया!</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-2">
              📌 महत्वपूर्ण जानकारी:
            </p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• यह ट्रैकिंग ID सुरक्षित रखें</li>
              <li>• इससे आप अपने आवेदन की स्थिति जान सकते हैं</li>
              <li>• Keep this Tracking ID safe for future reference</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onTrackOrder(successTrackingId)}
              className="w-full"
            >
              ट्रैक करें / Track Order
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full">
              होम पर जाएं / Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActorLoading = actorFetching;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg">आवेदन फॉर्म</h1>
          <p className="text-xs opacity-80">{selectedService || "सेवा चुनें"}</p>
        </div>
      </div>

      {/* Actor loading warning */}
      {isActorLoading && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
          <p className="text-sm text-amber-700">
            सिस्टम तैयार हो रहा है, कृपया प्रतीक्षा करें...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-24">
        {/* Service Selection */}
        <div className="space-y-2">
          <Label htmlFor="service" className="text-sm font-semibold">
            सेवा चुनें <span className="text-destructive">*</span>
          </Label>
          <select
            id="service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">-- सेवा चुनें --</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            पूरा नाम <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="अपना पूरा नाम दर्ज करें"
            required
          />
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-sm font-semibold">
            मोबाइल नंबर <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="10 अंकों का मोबाइल नंबर"
            maxLength={10}
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold">
            पता <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="अपना पूरा पता दर्ज करें"
            rows={3}
            required
          />
        </div>

        {/* ── Photo Upload (multiple) ───────────────────────────────────────── */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            फोटो (वैकल्पिक) — अधिकतम {MAX_FILES}
          </Label>

          {/* Thumbnail grid */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photoPreviews.map((src, idx) => (
                <div key={src.slice(-20)} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:bg-destructive/80 transition-colors"
                    data-ocid={`service_form.photo.remove_button.${idx + 1}`}
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload trigger */}
          {photoFiles.length < MAX_FILES ? (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              data-ocid="service_form.photo.upload_button"
            >
              {photoPreviews.length === 0 ? (
                <div className="space-y-2">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">6 तक फोटो चुनें</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG (max 5MB each)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    और फोटो जोड़ें ({photoFiles.length}/{MAX_FILES})
                  </span>
                </div>
              )}
            </button>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              अधिकतम {MAX_FILES} फोटो चुने गए हैं
            </p>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* ── Document Upload (multiple) ────────────────────────────────────── */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            दस्तावेज़ (वैकल्पिक) — अधिकतम {MAX_FILES}
          </Label>

          {/* Document list with thumbnails/icons */}
          {documentFiles.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {documentFiles.map((file, idx) => (
                <div
                  key={file.name + file.size}
                  className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={documentPreviews[idx]}
                      alt={`Doc ${idx + 1}`}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                  )}
                  <span className="text-xs text-foreground flex-1 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(idx)}
                    className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors flex-shrink-0"
                    data-ocid={`service_form.doc.remove_button.${idx + 1}`}
                    aria-label={`Remove document ${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload trigger */}
          {documentFiles.length < MAX_FILES ? (
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              data-ocid="service_form.doc.upload_button"
            >
              {documentFiles.length === 0 ? (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    6 तक दस्तावेज़ चुनें
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, PDF (max 10MB each)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    और दस्तावेज़ जोड़ें ({documentFiles.length}/{MAX_FILES})
                  </span>
                </div>
              )}
            </button>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              अधिकतम {MAX_FILES} दस्तावेज़ चुने गए हैं
            </p>
          )}

          <input
            ref={documentInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={handleDocumentChange}
            className="hidden"
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2"
            data-ocid="service_form.error_state"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting || isActorLoading}
            data-ocid="service_form.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {submitStage === "files"
                  ? "फाइलें तैयार हो रही हैं..."
                  : "जमा हो रहा है..."}
              </span>
            ) : isActorLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                तैयार हो रहा है...
              </span>
            ) : (
              "जमा करें / Submit"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
