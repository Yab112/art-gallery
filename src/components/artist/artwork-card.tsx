import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface Artwork {
    id: number
    title: string
    year: number
    artist: string
    gallery: string
    price: string
    image: string
    height: number
    sold: boolean
    medium: string
    rarity: string
}

interface ArtworkCardProps {
    artwork: Artwork
    onImageClick?: (src: string) => void
}

export function ArtworkCard({ artwork, onImageClick }: ArtworkCardProps) {
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setImagePosition({ x, y })
    }

    const handleMouseLeave = () => {
        setImagePosition({ x: 50, y: 50 })
        setIsHovered(false)
    }

    const handleImageClick = () => {
        if (onImageClick) {
            onImageClick(artwork.image)
        }
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/20">
            {/* Image Container with Zoom Effect */}
            <div
                className="zoom-container relative cursor-pointer bg-gallery-neutral"
                style={{ height: `${artwork.height * 0.6}px` }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onClick={handleImageClick}
            >
                {imageError || !artwork.image ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-2 text-gray-500 text-xs">No Image</p>
                        </div>
                    </div>
                ) : (
                    <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="zoom-image h-full w-full object-cover transition-transform duration-300"
                        style={{
                            transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                            transform: isHovered ? "scale(1.1)" : "scale(1)"
                        }}
                        onError={() => setImageError(true)}
                    />
                )}

                {artwork.sold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="rounded-full bg-red-600 px-3 py-1 font-medium text-sm text-white">
                            SOLD
                        </span>
                    </div>
                )}

                <div
                    className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Handle purchase logic
                            }}
                        >
                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <h3 className="text-pretty font-medium text-foreground">{artwork.artist}</h3>
                    <p className="text-pretty text-muted-foreground text-sm italic">
                        {artwork.title}, {artwork.year}
                    </p>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>{artwork.medium}</span>
                    <span>{artwork.rarity}</span>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">{artwork.gallery}</p>
                    <p
                        className={`font-medium text-sm ${
                            artwork.sold ? "text-red-600" : "text-foreground"
                        }`}
                    >
                        {artwork.sold ? "SOLD" : artwork.price}
                    </p>
                </div>
            </div>
        </div>
    )
}
