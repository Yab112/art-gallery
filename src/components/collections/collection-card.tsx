import { cn } from "@/lib/utils"
import { useState } from "react"
import { Link } from "react-router-dom"

export interface CollectionCardData {
    id: string
    name: string
    description?: string
    coverImage?: string
    artworkCount?: number
    user?: { name?: string }
}

const COLLECTION_NAME_MAX = 42

export function truncateCollectionName(name: string, max = COLLECTION_NAME_MAX): string {
    if (name.length <= max) return name
    return `${name.slice(0, max).trim()}...`
}

interface CollectionCoverImageProps {
    src: string
    alt: string
    onError?: () => void
    className?: string
}

/** Same pan/zoom hover as artwork cards */
export function CollectionCoverImage({
    src,
    alt,
    onError,
    className
}: CollectionCoverImageProps) {
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

    return (
        <div
            className={cn("relative overflow-hidden bg-gray-100", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <img
                src={src}
                alt={alt}
                className="block h-full w-full object-cover transition-transform duration-300 ease-in-out transform-gpu"
                style={{
                    transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                    transform: isHovered ? "scale(1.2)" : "scale(1)"
                }}
                onError={onError}
            />
        </div>
    )
}

interface CollectionCardGlassFooterProps {
    name: string
    artworkCount: number
    userName?: string
    className?: string
}

export function CollectionCardGlassFooter({
    name,
    artworkCount,
    userName,
    className
}: CollectionCardGlassFooterProps) {
    const meta = [
        `${artworkCount} ${artworkCount === 1 ? "artwork" : "artworks"}`,
        userName
    ]
        .filter(Boolean)
        .join(" · ")

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 border-white/20 border-t bg-black/40 px-3 py-2.5 backdrop-blur-md",
                className
            )}
        >
            <h3 className="line-clamp-1 font-semibold text-sm text-white leading-tight" title={name}>
                {name}
            </h3>
            <p className="line-clamp-1 text-white/75 text-xs leading-tight">{meta}</p>
        </div>
    )
}

interface CollectionGridCardProps {
    collection: CollectionCardData
    imageError?: boolean
    onImageError?: () => void
    featured?: boolean
    /** Route to return to from collection detail (passed via link state) */
    listFrom?: string
}

export function CollectionGridCard({
    collection,
    imageError,
    onImageError,
    featured = false,
    listFrom = "/collections"
}: CollectionGridCardProps) {
    const artworkCount = collection.artworkCount ?? 0

    return (
        <Link
            to={`/collections/${collection.id}`}
            state={{ from: listFrom }}
            className="block"
        >
            <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className={`relative overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                    {collection.coverImage && !imageError ? (
                        <CollectionCoverImage
                            src={collection.coverImage}
                            alt={collection.name}
                            onError={onImageError}
                            className="absolute inset-0 h-full w-full"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-stone-100 text-gray-400 text-sm">
                            No cover
                        </div>
                    )}
                    <CollectionCardGlassFooter
                        name={collection.name}
                        artworkCount={artworkCount}
                        userName={collection.user?.name}
                    />
                </div>
            </article>
        </Link>
    )
}

interface CollectionListRowProps {
    collection: CollectionCardData
    imageError?: boolean
    onImageError?: () => void
    listFrom?: string
}

export function CollectionListRow({
    collection,
    imageError,
    onImageError,
    listFrom = "/collections"
}: CollectionListRowProps) {
    const artworkCount = collection.artworkCount ?? 0
    const meta = [
        `${artworkCount} ${artworkCount === 1 ? "artwork" : "artworks"}`,
        collection.user?.name
    ]
        .filter(Boolean)
        .join(" · ")

    return (
        <Link
            to={`/collections/${collection.id}`}
            state={{ from: listFrom }}
            className="block"
        >
            <article className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-gray-100 sm:h-28 sm:w-36">
                    {collection.coverImage && !imageError ? (
                        <CollectionCoverImage
                            src={collection.coverImage}
                            alt={collection.name}
                            onError={onImageError}
                            className="h-full w-full"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-stone-100 text-gray-400 text-xs">
                            No cover
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                    <h3
                        className="line-clamp-1 font-semibold text-base text-gray-900 leading-tight sm:text-lg"
                        title={collection.name}
                    >
                        {collection.name}
                    </h3>
                    <p className="line-clamp-1 text-gray-500 text-sm leading-tight">{meta}</p>
                </div>
            </article>
        </Link>
    )
}
