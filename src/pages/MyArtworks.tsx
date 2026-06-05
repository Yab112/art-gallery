import { ArtworkCard } from "@/components/artwork-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MyArtworksSkeleton } from "@/components/skeletons/my-artworks-skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useMyArtworks } from "@/queries/artworkQueries"
import { artworkKeys } from "@/queries/queryKeys"
import { useDeleteArtwork } from "@/services/artwork/useDeleteArtwork"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Edit, Eye, Palette, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function MyArtworksPage() {
    const [page, setPage] = useState(1)
    const limit = 12
    const navigate = useNavigate()
    const { data, isLoading, error } = useMyArtworks({ page, limit })
    const { deleteArtwork, isDeleting } = useDeleteArtwork()
    const queryClient = useQueryClient()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null)

    const artworks = data?.artworks || []
    const pagination = {
        page: data?.page || 1,
        limit: data?.limit || limit,
        total: data?.total || 0,
        pages: data?.pages || 1
    }

    const handleDeleteClick = (artworkId: string) => {
        setArtworkToDelete(artworkId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!artworkToDelete) return

        try {
            await deleteArtwork(artworkToDelete)
            queryClient.invalidateQueries({ queryKey: artworkKeys.myArtworks() })
            setDeleteDialogOpen(false)
            setArtworkToDelete(null)
            toast.success("Artwork deleted successfully")
        } catch (error: any) {
            toast.error(`Failed to delete artwork: ${error?.message || "An error occurred"}`)
        }
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <MyArtworksSkeleton />
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <div className="container mx-auto max-w-7xl px-4 py-4">
                        <EmptyState
                            icon={Palette}
                            title="Error Loading Artworks"
                            description="Failed to load your artworks. Please try again later."
                        />
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    {/* Header */}
                    <div className="mb-4 border-gray-200 border-b bg-white py-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate("/profile")}
                                    className="h-8 w-8"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h1 className="font-semibold text-gray-900 text-xl">My Artworks</h1>
                                <span className="text-gray-500 text-sm">({pagination.total})</span>
                            </div>
                            <Button
                                onClick={() => navigate("/sellart")}
                                className="flex items-center justify-center gap-2 rounded-full bg-red-700 text-white hover:bg-red-800 w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4" />
                                Create Artwork
                            </Button>
                        </div>
                    </div>

                    {/* Artworks Grid */}
                    {artworks.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {artworks.map((artwork) => (
                                    <div key={artwork.id} className="group relative">
                                        <ArtworkCard
                                            id={artwork.id}
                                            image={artwork.photos?.[0] || "/placeholder.svg"}
                                            title={artwork.title || "Untitled"}
                                            artist={artwork.artist}
                                            price={`$${artwork.desiredPrice?.toLocaleString() || "0"}`}
                                            year={artwork.yearOfArtwork}
                                            medium={artwork.technique}
                                            dimensions={`${artwork.dimensions?.height || 0}x${artwork.dimensions?.width || 0} cm`}
                                            seller={artwork.user?.name || "Unknown"}
                                            status={artwork.status}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 bg-white hover:bg-gray-100"
                                                asChild
                                            >
                                                <Link to={`/artwork/${artwork.id}`}>
                                                    <Eye className="h-3.5 w-3.5 text-gray-700" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 bg-white hover:bg-gray-100"
                                                asChild
                                            >
                                                <Link to={`/artwork/${artwork.id}/edit`}>
                                                    <Edit className="h-3.5 w-3.5 text-gray-700" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleDeleteClick(artwork.id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <PaginationControls
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={setPage}
                                    totalItems={pagination.total}
                                    itemLabel="artworks"
                                    itemLabelSingular="artwork"
                                />
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={Palette}
                            title="No Artworks Yet"
                            description="You haven't uploaded any artworks yet. Start by adding your first piece!"
                            actionLabel="Add New Artwork"
                            onAction={() => (window.location.href = "/sellart")}
                        />
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this artwork? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setArtworkToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ProtectedRoute>
    )
}
