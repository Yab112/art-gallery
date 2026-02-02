import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { artworkKeys } from "@/queries/queryKeys"
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork"
import type { Artwork } from "@/types/artwork.types"
import { useQueryClient } from "@tanstack/react-query"
import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Heart,
    Loader2,
    MessageSquare,
    Share2,
    Star,
    Trash2,
    XCircle
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArtworkCollectionManager } from "./artwork-collection-manager"

interface ArtworkOwnerPanelProps {
    artwork: Artwork
}

const statusConfig = {
    PENDING: {
        label: "Pending Review",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
    },
    APPROVED: {
        label: "Approved",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
    },
    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
    },
    SOLD: {
        label: "Sold",
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    WITHDRAWN: {
        label: "Withdrawn",
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
    }
}

export function ArtworkOwnerPanel({ artwork }: ArtworkOwnerPanelProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const { deleteArtwork, isDeleting } = useDeleteArtwork()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const statusInfo =
        statusConfig[artwork.status as keyof typeof statusConfig] || statusConfig.PENDING
    const StatusIcon = statusInfo.icon

    const handleDelete = async () => {
        try {
            await deleteArtwork(artwork.id)
            queryClient.invalidateQueries({ queryKey: artworkKeys.lists() })
            toast.success("Artwork deleted successfully")
            navigate("/profile/my-artworks")
        } catch (error: any) {
            toast.error(`Failed to delete artwork: ${error?.message || "An error occurred"}`)
        } finally {
            setShowDeleteDialog(false)
        }
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/artwork/${artwork.id}`
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    const stats = [
        {
            label: "Views",
            value: artwork.interactions?.filter((i: any) => i.type === "VIEW")?.length || 0,
            icon: Eye,
            color: "text-blue-600"
        },
        {
            label: "Likes",
            value: artwork.likeCount || 0,
            icon: Heart,
            color: "text-red-600"
        },
        {
            label: "Comments",
            value: artwork.commentCount || 0,
            icon: MessageSquare,
            color: "text-green-600"
        },
        {
            label: "Reviews",
            value: artwork.reviewCount || 0,
            icon: Star,
            color: "text-yellow-600"
        }
    ]

    return (
        <div className="space-y-3">
            {/* Status Badge */}
            <Card className={`border border-gray-100 bg-gray-50/50 p-2.5 ${statusInfo.bgColor}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <div>
                            <p className="text-gray-500 text-xs">Status</p>
                            <p className={`font-semibold text-sm ${statusInfo.color}`}>
                                {statusInfo.label}
                            </p>
                        </div>
                    </div>
                    {artwork.status === "APPROVED" && (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Live</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Statistics */}
            <Card className="border border-gray-100 bg-gray-50/30 p-3">
                <div className="mb-3 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-700 text-sm">Statistics</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center rounded-md border border-gray-100 bg-white/50 p-2"
                            >
                                <Icon className={`h-4 w-4 ${stat.color} mb-1 opacity-80`} />
                                <p className="font-bold text-gray-800 text-lg">{stat.value}</p>
                                <p className="text-gray-500 text-xs">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-100 bg-gray-50/30 p-3">
                <h3 className="mb-2.5 font-semibold text-gray-700 text-sm">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-start text-xs"
                        asChild
                    >
                        <Link to={`/artwork/${artwork.id}/edit`}>
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Edit Artwork
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-start text-xs"
                        onClick={handleShare}
                    >
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        Share Artwork
                    </Button>

                    <div className="w-full">
                        <ArtworkCollectionManager artworkId={artwork.id} />
                    </div>

                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-full justify-start text-xs"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete Artwork
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                            <DialogHeader>
                                <DialogTitle>Delete Artwork</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{artwork.title || "Untitled"}"?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>

            {/* Artwork Details Summary */}
            <Card className="border border-gray-100 bg-gray-50/30 p-3">
                <h3 className="mb-2.5 font-semibold text-gray-700 text-sm">Artwork Details</h3>
                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-semibold text-gray-800">
                            ${artwork.desiredPrice?.toLocaleString() || "0"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Price Negotiation:</span>
                        <span
                            className={
                                artwork.acceptPriceNegotiation ? "text-green-600" : "text-gray-400"
                            }
                        >
                            {artwork.acceptPriceNegotiation ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-600">
                            {new Date(artwork.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="text-gray-600">
                            {new Date(artwork.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Photos:</span>
                        <span className="text-gray-600">
                            {artwork.photos?.length || 0} photo(s)
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Proof of Origin:</span>
                        <span className="text-gray-600">
                            {artwork.proofOfOrigin ? "✓ Provided" : "✗ Not provided"}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Comments & Reviews Preview */}
            {(artwork.commentCount > 0 || artwork.reviewCount > 0) && (
                <Card className="border border-gray-100 bg-gray-50/30 p-3">
                    <h3 className="mb-2.5 font-semibold text-gray-700 text-sm">Engagement</h3>
                    <div className="space-y-2">
                        {artwork.comments && artwork.comments.length > 0 && (
                            <div>
                                <p className="mb-1.5 font-medium text-gray-500 text-xs">
                                    Recent Comments:
                                </p>
                                <div className="space-y-1.5">
                                    {artwork.comments.slice(0, 3).map((comment: any) => (
                                        <div
                                            key={comment.id}
                                            className="rounded-md border border-gray-100 bg-white/50 p-2"
                                        >
                                            <p className="font-medium text-gray-700 text-xs">
                                                {comment.authorName}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {comment.content}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-gray-400">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {artwork.reviews && artwork.reviews.length > 0 && (
                            <div>
                                <p className="mb-1.5 font-medium text-gray-500 text-xs">
                                    Recent Reviews:
                                </p>
                                <div className="space-y-1.5">
                                    {artwork.reviews.slice(0, 3).map((review: any) => (
                                        <div
                                            key={review.id}
                                            className="rounded-md border border-gray-100 bg-white/50 p-2"
                                        >
                                            <div className="mb-0.5 flex items-center gap-1.5">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${
                                                                i < review.rating
                                                                    ? "fill-yellow-400 text-yellow-400 opacity-80"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-700 text-xs">
                                                    {review.user?.name || "Anonymous"}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-500 text-xs">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}
