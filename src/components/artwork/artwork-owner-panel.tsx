import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  Share2,
  FolderPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork";
import { useQueryClient } from "@tanstack/react-query";
import { artworkKeys } from "@/queries/queryKeys";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Artwork } from "@/types/artwork.types";
import { ArtworkCollectionManager } from "./artwork-collection-manager";

interface ArtworkOwnerPanelProps {
  artwork: Artwork;
}

const statusConfig = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  SOLD: {
    label: "Sold",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: AlertCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

export function ArtworkOwnerPanel({ artwork }: ArtworkOwnerPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteArtwork, isDeleting } = useDeleteArtwork();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const statusInfo = statusConfig[artwork.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  const handleDelete = async () => {
    try {
      await deleteArtwork(artwork.id);
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() });
      toast.success("Artwork deleted successfully");
      navigate("/profile/my-artworks");
    } catch (error: any) {
      toast.error("Failed to delete artwork: " + (error?.message || "An error occurred"));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/artwork/${artwork.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const stats = [
    {
      label: "Views",
      value: artwork.interactions?.filter((i: any) => i.type === "VIEW")?.length || 0,
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Likes",
      value: artwork.likeCount || 0,
      icon: Heart,
      color: "text-red-600",
    },
    {
      label: "Comments",
      value: artwork.commentCount || 0,
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      label: "Reviews",
      value: artwork.reviewCount || 0,
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <Card className={`p-2.5 border border-gray-100 bg-gray-50/50 ${statusInfo.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
          {artwork.status === "APPROVED" && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Live</span>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-3 border border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center p-2 bg-white/50 rounded-md border border-gray-100"
              >
                <Icon className={`h-4 w-4 ${stat.color} mb-1 opacity-80`} />
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-3 border border-gray-100 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs"
            asChild
          >
            <Link to={`/artwork/${artwork.id}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit Artwork
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
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
                className="w-full justify-start h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Artwork
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Delete Artwork</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{artwork.title || "Untitled"}"? This action cannot be undone.
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      <Card className="p-3 border border-gray-100 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Artwork Details</h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Price:</span>
            <span className="font-semibold text-gray-800">${artwork.desiredPrice?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Price Negotiation:</span>
            <span className={artwork.acceptPriceNegotiation ? "text-green-600" : "text-gray-400"}>
              {artwork.acceptPriceNegotiation ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created:</span>
            <span className="text-gray-600">{new Date(artwork.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Updated:</span>
            <span className="text-gray-600">{new Date(artwork.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Photos:</span>
            <span className="text-gray-600">{artwork.photos?.length || 0} photo(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Proof of Origin:</span>
            <span className="text-gray-600">{artwork.proofOfOrigin ? "✓ Provided" : "✗ Not provided"}</span>
          </div>
        </div>
      </Card>

      {/* Comments & Reviews Preview */}
      {(artwork.commentCount > 0 || artwork.reviewCount > 0) && (
        <Card className="p-3 border border-gray-100 bg-gray-50/30">
          <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Engagement</h3>
          <div className="space-y-2">
            {artwork.comments && artwork.comments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Recent Comments:</p>
                <div className="space-y-1.5">
                  {artwork.comments.slice(0, 3).map((comment: any) => (
                    <div
                      key={comment.id}
                      className="p-2 bg-white/50 rounded-md border border-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-700">{comment.authorName}</p>
                      <p className="text-xs text-gray-500">{comment.content}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {artwork.reviews && artwork.reviews.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Recent Reviews:</p>
                <div className="space-y-1.5">
                  {artwork.reviews.slice(0, 3).map((review: any) => (
                    <div
                      key={review.id}
                      className="p-2 bg-white/50 rounded-md border border-gray-100"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating
                                  ? "fill-yellow-400 text-yellow-400 opacity-80"
                                  : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-gray-500">{review.comment}</p>
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
  );
}

