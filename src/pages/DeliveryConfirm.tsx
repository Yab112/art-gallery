import { useState, useRef } from "react"
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom"
import SignatureCanvas from "react-signature-canvas"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useOrder } from "@/queries/orderQueries"
import { useConfirmDelivery, useDeliveryConfirmation } from "@/services/delivery/useDelivery"
import { AlertCircle, CheckCircle2, ChevronLeft, RefreshCw, Info } from "lucide-react"
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

export default function DeliveryConfirmPage() {
    const { orderId } = useParams<{ orderId: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { data: order, isLoading: isOrderLoading } = useOrder(orderId)
    const { data: existingConfirmation, isLoading: isConfirmationLoading } = useDeliveryConfirmation(orderId)
    const { mutateAsync: confirmDelivery, isPending } = useConfirmDelivery()

    const initialTab = searchParams.get("tab") === "dispute" ? "dispute" : "confirm"
    const [activeTab, setActiveTab] = useState<"confirm" | "dispute">(initialTab)
    const sigPad = useRef<SignatureCanvas>(null)
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    const [disputeReason, setDisputeReason] = useState(
        initialTab === "dispute" ? "NOT_RECEIVED" : "DAMAGED",
    )
    const [disputeNote, setDisputeNote] = useState("")
    const [attachment, setAttachment] = useState<string | null>(null)

    const handleClearSignature = () => {
        sigPad.current?.clear()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAttachment(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleConfirm = async () => {
        if (!orderId) return
        
        if (sigPad.current?.isEmpty()) {
            toast.error("Please provide your signature")
            return
        }

        if (!acceptedTerms) {
            toast.error("You must accept the terms")
            return
        }

        try {
            await confirmDelivery({
                orderId,
                signatureDataUrl: canvasToTrimmedDataUrl(sigPad.current!.getCanvas()),
                acceptedTerms,
                hasDispute: false
            })
            toast.success("Delivery confirmed successfully")
            navigate("/orders")
        } catch (error) {
            toast.error("Failed to confirm delivery")
            console.error(error)
        }
    }

    const handleDispute = async () => {
        if (!orderId) return

        try {
            await confirmDelivery({
                orderId,
                acceptedTerms: false,
                hasDispute: true,
                disputeReason,
                disputeNote,
                attachmentDataUrl: attachment || undefined
            })
            toast.success("Dispute submitted successfully")
            navigate("/orders")
        } catch (error) {
            toast.error("Failed to submit dispute")
            console.error(error)
        }
    }

    if (isOrderLoading || isConfirmationLoading) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            </ProtectedRoute>
        )
    }

    if (!order) {
        return (
            <ProtectedRoute>
                <div className="text-center py-12">Order not found.</div>
            </ProtectedRoute>
        )
    }

    if (existingConfirmation) {
        const isDispute = existingConfirmation.hasDispute
        return (
            <ProtectedRoute>
                <div className="container mx-auto max-w-2xl px-4 py-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
                        <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                                isDispute ? "bg-amber-100" : "bg-green-100"
                            }`}
                        >
                            {isDispute ? (
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            ) : (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold">
                            {isDispute ? "Dispute Already Submitted" : "Receipt Already Confirmed"}
                        </h2>
                        <p className="text-gray-500">
                            {isDispute
                                ? "You already raised a dispute for this order. Our team is reviewing it and will follow up. Seller payout for this sale stays reserved until resolution."
                                : "You already confirmed receipt for this order. No further action is needed."}
                        </p>
                        <Button asChild className="mt-4">
                            <Link to="/orders">Return to Orders</Link>
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="container mx-auto max-w-3xl px-4">
                    
                    <Button variant="ghost" className="mb-6 -ml-4" asChild>
                        <Link to="/orders"><ChevronLeft className="w-4 h-4 mr-2"/> Back to Orders</Link>
                    </Button>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900">Delivery Confirmation</h1>
                            <p className="text-gray-500 text-sm mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50/50 p-6 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Items Received</h3>
                            <div className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                            <img 
                                                src={item.artwork?.photos?.[0] || "/placeholder.svg"} 
                                                alt={item.artwork?.title} 
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.artwork?.title || "Untitled"}</h4>
                                            <p className="text-sm text-gray-500">{item.artwork?.artist || "Unknown Artist"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("confirm")}
                                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                                    activeTab === "confirm" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Confirm Receipt
                            </button>
                            <button
                                onClick={() => setActiveTab("dispute")}
                                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                                    activeTab === "dispute" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Raise Dispute
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === "confirm" ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base">Signature</Label>
                                            <Button variant="ghost" size="sm" onClick={handleClearSignature} className="text-gray-500">
                                                Clear
                                            </Button>
                                        </div>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                            <SignatureCanvas 
                                                ref={sigPad} 
                                                canvasProps={{className: 'w-full h-48 cursor-crosshair'}}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5" /> Please sign inside the box to confirm you received the artwork in good condition.
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="checkbox" 
                                            id="terms" 
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <Label htmlFor="terms" className="text-sm font-normal text-gray-700 leading-relaxed cursor-pointer">
                                            I confirm that I have received the artwork(s) in satisfactory condition. 
                                            I understand that by confirming, the funds will be released to the seller and the transaction will be completed.
                                        </Label>
                                    </div>

                                    <Button 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                        size="lg"
                                        onClick={handleConfirm}
                                        disabled={isPending}
                                    >
                                        {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm Delivery"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3 text-red-800 border border-red-100">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold mb-1">Having issues with your order?</p>
                                            <p>Raising a dispute reserves the seller payout for this sale while our admin team reviews your case.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Reason for Dispute</Label>
                                            <select 
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={disputeReason}
                                                onChange={(e) => setDisputeReason(e.target.value)}
                                            >
                                                <option value="NOT_RECEIVED">Did not receive artwork</option>
                                                <option value="DAMAGED">Artwork is Damaged</option>
                                                <option value="WRONG_ITEM">Received Wrong Artwork</option>
                                                <option value="NOT_AS_DESCRIBED">Not as Described</option>
                                                <option value="OTHER">Other Issue</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Additional Details (Optional)</Label>
                                            <Textarea 
                                                placeholder="Please provide any additional information to help us resolve this issue..."
                                                value={disputeNote}
                                                onChange={(e) => setDisputeNote(e.target.value)}
                                                className="min-h-[120px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Upload Evidence (Optional)</Label>
                                            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                                <Input 
                                                    type="file" 
                                                    accept="image/*,.pdf" 
                                                    onChange={handleFileChange}
                                                    className="bg-white"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">Upload a photo of the damage or wrong item.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white" 
                                        size="lg"
                                        onClick={handleDispute}
                                        disabled={isPending}
                                    >
                                        {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Submit Dispute"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
