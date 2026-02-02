import { ArtworkCard } from "@/components/artwork-card"
import { SectionTitle } from "@/components/section-title"
import { Button } from "@/components/ui/button"
import { mapArtworkToCardProps } from "@/lib/utils/artwork-mapper"
import { useArtworks } from "@/queries/artworkQueries"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

export function FeaturedArtworks() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const itemsPerPage = 4

    // Fetch approved artworks for featured section
    const { data: artworksData, isLoading } = useArtworks({
        limit: 12,
        page: 1,
        isApproved: true,
        sortBy: "createdAt",
        orderBy: "desc"
    })

    const artworks = useMemo(() => {
        if (!artworksData?.artworks) return []
        return artworksData.artworks.map(mapArtworkToCardProps)
    }, [artworksData])

    const handlePrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? Math.max(0, artworks.length - itemsPerPage) : prev - 1
        )
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= artworks.length - itemsPerPage ? 0 : prev + 1))
    }

    const handleFavorite = (id: string) => {
        console.log("[v0] Added to favorites:", id)
        // Add favorite logic here
    }

    const handleSearch = (id: string) => {
        console.log("[v0] Search artwork:", id)
        // Add search logic here
    }

    const visibleArtworks = artworks.slice(currentIndex, currentIndex + itemsPerPage)

    if (isLoading) {
        return (
            <section className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="FEATURED ARTWORKS"
                        subtitle="Artopia Selection"
                        className="mb-8"
                    />
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/5] rounded bg-gray-200" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!artworks || artworks.length === 0) {
        return (
            <section className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="FEATURED ARTWORKS"
                        subtitle="Artopia Selection"
                        className="mb-8"
                    />
                    <p className="text-center text-gray-500">
                        No featured artworks available at the moment.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="px-4 py-10">
            <div className="mx-auto max-w-7xl ">
                <div className="relative mb-12">
                    <SectionTitle
                        title="FEATURED ARTWORKS"
                        subtitle="Artopia Selection"
                        className="mb-8"
                    />

                    {/* Navigation Arrows */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 left-0 rounded-full bg-transparent"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 right-0 rounded-full bg-transparent"
                        onClick={handleNext}
                        disabled={currentIndex >= artworks.length - itemsPerPage}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Artworks Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {visibleArtworks.map((artwork) => (
                        <ArtworkCard
                            key={artwork.id}
                            {...artwork}
                            onFavorite={handleFavorite}
                            onSearch={handleSearch}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
