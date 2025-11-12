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
import { useDeleteArtwork } from "@/api/artwork/useDeleteArtwork";
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
    <div className="space-y-6">
      {/* Status Badge */}
      <Card className={`p-4 border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
          {artwork.status === "APPROVED" && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Live on marketplace</span>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
              >
                <Icon className={`h-6 w-6 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <Link to={`/artwork/${artwork.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Artwork
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Artwork
          </Button>

          <div className="w-full">
            <ArtworkCollectionManager artworkId={artwork.id} />
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Artwork
              </Button>
            </DialogTrigger>
            <DialogContent>
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
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Artwork Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold">${artwork.desiredPrice?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price Negotiation:</span>
            <span className={artwork.acceptPriceNegotiation ? "text-green-600" : "text-gray-400"}>
              {artwork.acceptPriceNegotiation ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span>{new Date(artwork.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Photos:</span>
            <span>{artwork.photos?.length || 0} photo(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Proof of Origin:</span>
            <span>{artwork.proofOfOrigin ? "✓ Provided" : "✗ Not provided"}</span>
          </div>
        </div>
      </Card>

      {/* Comments & Reviews Preview */}
      {(artwork.commentCount > 0 || artwork.reviewCount > 0) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
          <div className="space-y-2">
            {artwork.comments && artwork.comments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recent Comments:</p>
                <div className="space-y-2">
                  {artwork.comments.slice(0, 3).map((comment: any) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {artwork.reviews && artwork.reviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recent Reviews:</p>
                <div className="space-y-2">
                  {artwork.reviews.slice(0, 3).map((review: any) => (
                    <div
                      key={review.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">{review.comment}</p>
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

