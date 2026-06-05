import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export interface CtaPreviewArtwork {
    id: string
    image: string
    title?: string
}

interface MarketplaceCtaProps {
    title: string
    subtitle: string
    primaryButtonText: string
    secondaryButtonText: string
    previewArtworks?: CtaPreviewArtwork[]
    onPrimaryClick?: () => void
    onSecondaryClick?: () => void
}

export function MarketplaceCta({
    title,
    subtitle,
    primaryButtonText,
    secondaryButtonText,
    previewArtworks = [],
    onPrimaryClick,
    onSecondaryClick
}: MarketplaceCtaProps) {
    const artworks = previewArtworks.filter((item) => item.image).slice(0, 4)
    const rotations = [-6, -2, 2, 6]

    return (
        <section className="mx-3 mb-6 sm:mx-4">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 px-5 py-8 sm:px-8 sm:py-10">
                <div className="-right-16 -top-16 pointer-events-none absolute h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />
                <div className="-bottom-20 -left-10 pointer-events-none absolute h-56 w-56 rounded-full bg-red-700/10 blur-3xl" />

                {artworks.length > 0 && (
                    <div className="relative mb-7 flex items-end justify-center gap-3 py-2 sm:gap-4">
                        {artworks.map((artwork, index) => (
                            <div
                                key={artwork.id}
                                style={{ transform: `rotate(${rotations[index] ?? 0}deg)` }}
                            >
                                <Link
                                    to={`/artwork/${artwork.id}`}
                                    title={artwork.title || "View artwork"}
                                    className="group relative block overflow-hidden rounded-xl border border-white/15 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-white/40"
                                    style={{
                                        width: "4.5rem",
                                        height: "5.75rem"
                                    }}
                                >
                                    <img
                                        src={artwork.image}
                                        alt={artwork.title || "Artwork preview"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
                                    <span className="absolute inset-x-0 bottom-1 text-center font-medium text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        View
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative text-center">
                    <h2 className="font-poppins font-semibold text-2xl text-white tracking-tight sm:text-3xl">
                        {title}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-white/70 sm:text-base">
                        {subtitle}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="rounded-full bg-white px-6 text-gray-900 hover:bg-gray-100"
                            onClick={onPrimaryClick}
                        >
                            {primaryButtonText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full border-white/30 bg-transparent px-6 text-white hover:text-orange-600 hover:bg-none hover:bg-transparent"
                            onClick={onSecondaryClick}
                        >
                            {secondaryButtonText}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
