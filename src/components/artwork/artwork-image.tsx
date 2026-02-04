import type React from "react"
import { useState } from "react"

interface ArtworkImageProps {
    src: string
    alt: string
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })

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

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    return (
        <div
            className="aspect-[4/5] overflow-hidden bg-gray-100"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {imageError || !src ? (
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
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out"
                    style={{
                        transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                        transform: isHovered ? "scale(1.2)" : "scale(1)"
                    }}
                    onError={() => setImageError(true)}
                />
            )}
        </div>
    )
}
