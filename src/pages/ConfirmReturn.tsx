import { useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import SignatureCanvas from "react-signature-canvas"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useConfirmReturn,
  useSellerDispute,
} from "@/services/disputes/useConfirmReturn"
import { AlertCircle, CheckCircle2, ChevronLeft, Info } from "lucide-react"
import { toast } from "sonner"

/** Avoid react-signature-canvas getTrimmedCanvas() — trim-canvas breaks under Vite ESM. */
function canvasToTrimmedDataUrl(source: HTMLCanvasElement): string {
  const ctx = source.getContext("2d")
  if (!ctx) return source.toDataURL("image/png")

  const { width, height } = source
  const pixels = ctx.getImageData(0, 0, width, height).data

  let top = height
  let left = width
  let right = 0
  let bottom = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3]
      if (alpha > 0) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }

  if (right < left || bottom < top) {
    return source.toDataURL("image/png")
  }

  const trimW = right - left + 1
  const trimH = bottom - top + 1
  const trimmed = document.createElement("canvas")
  trimmed.width = trimW
  trimmed.height = trimH
  const trimmedCtx = trimmed.getContext("2d")
  if (!trimmedCtx) return source.toDataURL("image/png")

  trimmedCtx.drawImage(source, left, top, trimW, trimH, 0, 0, trimW, trimH)
  return trimmed.toDataURL("image/png")
}

function ConfirmReturnInner() {
  const { disputeId } = useParams<{ disputeId: string }>()
  const navigate = useNavigate()
  const { data: dispute, isLoading, error } = useSellerDispute(disputeId)
  const { mutateAsync: confirmReturn, isPending } = useConfirmReturn()
  const sigPad = useRef<SignatureCanvas>(null)
  const [note, setNote] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  const handleClearSignature = () => sigPad.current?.clear()

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = Math.max(0, 5 - photos.length)
    if (remaining === 0) {
      toast.error("You can add at most 5 photos")
      e.target.value = ""
      return
    }

    const toRead = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.message(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added`)
    }

    Promise.all(
      toRead.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          }),
      ),
    )
      .then((next) => setPhotos((prev) => [...prev, ...next].slice(0, 5)))
      .catch(() => toast.error("Could not read one or more photos"))

    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!disputeId) return
    if (sigPad.current?.isEmpty()) {
      toast.error("Please sign to confirm you received the artwork")
      return
    }

    try {
      await confirmReturn({
        disputeId,
        signatureDataUrl: canvasToTrimmedDataUrl(sigPad.current!.getCanvas()),
        note: note.trim() || undefined,
        photoDataUrls: photos.length ? photos : undefined,
      })
      toast.success("Return receipt confirmed. Admin will complete the refund.")
      navigate("/profile?tab=shipments")
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to confirm return",
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading dispute…
      </div>
    )
  }

  if (error || !dispute) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium">Dispute not found or access denied</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/profile?tab=shipments">Back to shipments</Link>
        </Button>
      </div>
    )
  }

  if (dispute.status === "READY_FOR_REFUND" && dispute.returnConfirmedAt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
        <p className="font-medium">Return already confirmed</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Waiting for admin to complete the refund.
        </p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/profile?tab=shipments">Back to shipments</Link>
        </Button>
      </div>
    )
  }

  if (dispute.status !== "WAITING_FOR_RETURN") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Info className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">This dispute is not waiting for a return</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Current status: {dispute.status}
        </p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/profile?tab=shipments">Back to shipments</Link>
        </Button>
      </div>
    )
  }

  const title = dispute.artwork?.title || "Artwork"

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/profile?tab=shipments">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Shipments
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight">
        Confirm returned artwork
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm only that you <span className="font-medium text-foreground">received</span>{" "}
        the returned piece. This is not a condition check — damage claims after
        return are handled separately and will not block the buyer refund.
      </p>

      <div className="mt-6 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">
          Order #{dispute.orderId?.slice(0, 8)?.toUpperCase()} · Dispute reason:{" "}
          {String(dispute.reason || "").replace(/_/g, " ")}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <Label>Signature *</Label>
          <Button variant="ghost" size="sm" onClick={handleClearSignature}>
            Clear
          </Button>
        </div>
        <div className="overflow-hidden rounded-md border bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{ className: "w-full h-48 cursor-crosshair" }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="note">Optional note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Package received on porch"
          className="min-h-[72px] resize-none"
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="photos">Optional photos (max 5)</Label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotos}
          className="block w-full text-sm"
        />
        {photos.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photos.map((src, i) => (
              <div
                key={`${i}-${src.slice(0, 32)}`}
                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                <img
                  src={src}
                  alt={`Return photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} photo{photos.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>

      <Button
        className="mt-6 w-full"
        disabled={isPending}
        onClick={handleSubmit}
      >
        {isPending ? "Submitting…" : "I received the returned artwork"}
      </Button>
    </div>
  )
}

export default function ConfirmReturnPage() {
  return (
    <ProtectedRoute>
      <ConfirmReturnInner />
    </ProtectedRoute>
  )
}
