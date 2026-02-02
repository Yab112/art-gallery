import { Button } from "@/components/ui/button"
import type { Artwork } from "@/types/artwork.types"
import { useNavigate } from "react-router-dom"

interface ArtworkGalleryInfoProps {
    artwork: Artwork
    isOwner?: boolean
}

export const ArtworkGalleryInfo = ({ artwork, isOwner = false }: ArtworkGalleryInfoProps) => {
    const navigate = useNavigate()

    const handleContactGallery = () => {
        if (artwork.user?.id) {
            navigate(`/artist/${artwork.user.id}`)
        }
    }

    return (
        <div className="border-gray-200 border-t pt-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                        {artwork.user?.name || artwork.artist || "Gallery"}
                    </h3>
                    <p className="text-gray-500 text-xs">
                        {artwork.user?.email || "Contact information"}
                    </p>
                </div>
                {!isOwner && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-300 bg-white px-4 py-1.5 text-gray-700 text-xs hover:bg-gray-100"
                        onClick={handleContactGallery}
                    >
                        Contact Gallery
                    </Button>
                )}
            </div>
        </div>
    )
}
