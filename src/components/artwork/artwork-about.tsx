import { Button } from "@/components/ui/button"
import type { Artwork } from "@/types/artwork.types"
import { useNavigate } from "react-router-dom"

interface ArtworkAboutProps {
    artwork: Artwork
    isOwner?: boolean
}

export const ArtworkAbout = ({ artwork, isOwner = false }: ArtworkAboutProps) => {
    const navigate = useNavigate()
    const dimensions = artwork.dimensions as {
        width: number
        height: number
        depth?: number
    } | null
    const dimensionsStr = dimensions
        ? `${dimensions.width} × ${dimensions.height}${dimensions.depth ? ` × ${dimensions.depth}` : ""} in`
        : "N/A"

    const handleSeeProfile = () => {
        if (artwork.user?.id) {
            navigate(`/artist/${artwork.user.id}`)
        }
    }

    const artistInitials =
        artwork.artist
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "A"

    return (
        <div className="my-4 max-w-4xl">
            <h3 className="mb-3 border-gray-200 border-b pb-1.5 font-semibold text-base text-gray-900">
                About the work
            </h3>
            <div className="grid gap-x-3 gap-y-1 text-xs md:grid-cols-2">
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Materials</span>
                    <span className="cursor-pointer text-gray-700 underline">
                        {artwork.technique}
                    </span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Size</span>
                    <span className="text-gray-700">{dimensionsStr}</span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Support</span>
                    <span className="cursor-pointer text-gray-700 underline">
                        {artwork.support}
                    </span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">State</span>
                    <span className="cursor-pointer text-gray-700 underline">{artwork.state}</span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Year</span>
                    <span className="text-gray-700">{artwork.yearOfArtwork}</span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Origin</span>
                    <span className="cursor-pointer text-gray-700 underline">{artwork.origin}</span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Frame</span>
                    <span className="text-gray-700">
                        {artwork.isFramed ? "Included" : "Not included"}
                    </span>
                </div>
                <div className="flex justify-between border-gray-200 border-b py-1.5">
                    <span className="text-gray-500">Weight</span>
                    <span className="text-gray-700">{artwork.weight}</span>
                </div>
            </div>
            {artwork.description && (
                <div className="mt-3">
                    <h4 className="mb-1.5 font-semibold text-gray-900 text-sm">Description</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{artwork.description}</p>
                </div>
            )}
            {/* Artist Information */}
            {artwork.user && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-2.5">
                        {artwork.user.image ? (
                            <img
                                src={artwork.user.image}
                                alt={artwork.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-bold text-white text-xs">
                                {artistInitials}
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                                {artwork.user.name}
                            </h4>
                            <p className="text-gray-500 text-xs">{artwork.user.email}</p>
                        </div>
                    </div>
                    {!isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-gray-300 bg-white px-4 py-1.5 text-gray-700 text-xs hover:bg-gray-100"
                            onClick={handleSeeProfile}
                        >
                            See Profile
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
