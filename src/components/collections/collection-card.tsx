import { cn } from "@/lib/utils"
import { ImageIcon, User } from "lucide-react"
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
    const displayName = truncateCollectionName(collection.name)

    return (
        <Link
            to={`/collections/${collection.id}`}
            state={{ from: listFrom }}
            className="block"
        >
            <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div
                    className={`relative ${
                        featured ? "aspect-[16/10]" : "aspect-[4/3]"
                    }`}
                >
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
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 p-4">
                        <h3
                            className="truncate font-semibold text-white text-base leading-snug sm:text-lg"
                            title={collection.name}
                        >
                            {displayName}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/85 text-xs sm:text-sm">
                            <span className="inline-flex items-center gap-1">
                                <ImageIcon className="h-3.5 w-3.5" />
                                {artworkCount} {artworkCount === 1 ? "artwork" : "artworks"}
                            </span>
                            {collection.user?.name && (
                                <span className="inline-flex min-w-0 max-w-[55%] items-center gap-1">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{collection.user.name}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {collection.description && (
                    <p className="line-clamp-2 px-4 py-3 text-gray-600 text-sm leading-relaxed">
                        {collection.description}
                    </p>
                )}
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
    const displayName = truncateCollectionName(collection.name)

    return (
        <Link
            to={`/collections/${collection.id}`}
            state={{ from: listFrom }}
            className="block"
        >
            <article className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                {collection.coverImage && !imageError ? (
                    <CollectionCoverImage
                        src={collection.coverImage}
                        alt={collection.name}
                        onError={onImageError}
                        className="h-28 w-36 shrink-0 sm:h-32 sm:w-44"
                    />
                ) : (
                    <div className="flex h-28 w-36 shrink-0 items-center justify-center bg-stone-100 text-gray-400 text-xs sm:h-32 sm:w-44">
                        No cover
                    </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5">
                    <h3
                        className="truncate font-semibold text-base text-gray-900 sm:text-lg"
                        title={collection.name}
                    >
                        {displayName}
                    </h3>
                    {collection.description && (
                        <p className="mt-1 line-clamp-2 text-gray-500 text-sm">
                            {collection.description}
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {artworkCount} {artworkCount === 1 ? "artwork" : "artworks"}
                        </span>
                        {collection.user?.name && (
                            <span className="inline-flex min-w-0 items-center gap-1">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{collection.user.name}</span>
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    )
}
