import { ArtistCard } from "@/components/artist/artist-circle-card"
import { Button } from "@/components/ui/button"
import { useGetTrendingArtists } from "@/services/artwork/useGetTrendingArtists"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { SectionTitle } from "../section-title"

export function TrendingArtists() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [hasDragged, setHasDragged] = useState(false)

    // Fetch trending artists based on engagement metrics (limit: 10)
    const { data: trendingData, isLoading, error, isError } = useGetTrendingArtists(10)

    const artists = trendingData?.artists || []

    // Debug logging (development only)
    if (import.meta.env.DEV) {
        console.log("Trending Artists Component State:", {
            isLoading,
            isError,
            hasData: !!trendingData,
            artistsCount: artists.length,
            error: error
                ? {
                      message: (error as any)?.message,
                      response: (error as any)?.response?.data,
                      status: (error as any)?.response?.status
                  }
                : null
        })

        if (error) {
            console.error("Error loading trending artists:", error)
        }

        if (trendingData) {
            console.log("Trending artists data:", trendingData)
            console.log("Artists array:", artists)
        }
    }

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 280 // Width of one card plus gap
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            })
        }
    }

    // Drag to scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        setHasDragged(false)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
        scrollRef.current.style.cursor = "grabbing"
        scrollRef.current.style.userSelect = "none"
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk
        if (Math.abs(walk) > 5) {
            setHasDragged(true) // Only set if actually moved
        }
    }

    const handleMouseUp = () => {
        if (!scrollRef.current) return
        setIsDragging(false)
        scrollRef.current.style.cursor = "grab"
        scrollRef.current.style.userSelect = "auto"
        // Reset hasDragged after a short delay to allow click events
        setTimeout(() => setHasDragged(false), 100)
    }

    const handleMouseLeave = () => {
        if (!scrollRef.current) return
        setIsDragging(false)
        scrollRef.current.style.cursor = "grab"
        scrollRef.current.style.userSelect = "auto"
        setTimeout(() => setHasDragged(false), 100)
    }

    // Map trending artists data to the Artist interface expected by ArtistCard
    const mappedArtists = artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        email: artist.email,
        country: artist.location || "Unknown",
        followers: 0, // We don't have followers data from backend yet
        artworks: artist.artworkCount || 0,
        avatar: artist.avatar || "/placeholder.svg",
        sales: artist.totalSales || 0,
        views: artist.totalViews || artist.profileViews || 0,
        rating: (artist.salesCount || 0) > 0 ? 4.5 : undefined, // Optional rating based on sales
        isTopSelling: (artist.salesCount || 0) > 0,
        isMostViewed: (artist.totalViews || artist.profileViews || 0) > 100,
        talentTypes: artist.talentTypes || []
    }))

    if (isLoading) {
        return (
            <section className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="TRENDING ARTISTS"
                        subtitle="Discover popular creators"
                        className="mb-8"
                    />
                    <div className="flex gap-4 overflow-x-auto">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-64 flex-shrink-0 animate-pulse">
                                <div className="rounded-lg border bg-white p-3 lg:p-4">
                                    <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-gray-200 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20" />
                                    <div className="mx-auto mb-2 h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="mx-auto mb-2 h-3 w-1/2 rounded bg-gray-200" />
                                    <div className="mb-1 h-3 w-full rounded bg-gray-200" />
                                    <div className="h-3 w-full rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!artists || artists.length === 0) {
        return (
            <section className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="TRENDING ARTISTS"
                        subtitle="Discover popular creators"
                        className="mb-8"
                    />
                    <p className="text-center text-gray-500">
                        No trending artists available at the moment.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="px-4 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="relative mb-12">
                    <SectionTitle
                        title="TRENDING ARTISTS"
                        subtitle="Discover popular creators"
                        className="mb-8"
                    />

                    {/* Navigation Arrows */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 left-0 rounded-full bg-transparent"
                        onClick={() => scroll("left")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 right-0 rounded-full bg-transparent"
                        onClick={() => scroll("right")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Horizontal Scrollable Artists */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="scrollbar-hide flex cursor-grab gap-4 overflow-x-auto px-2 active:cursor-grabbing"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {mappedArtists.map((artist) => (
                            <div key={artist.id} className="w-64 flex-shrink-0">
                                <Link
                                    to={`/artist/${artist.id}`}
                                    className="block"
                                    onClick={(e) => {
                                        // Prevent navigation if user was dragging
                                        if (hasDragged) {
                                            e.preventDefault()
                                        }
                                    }}
                                >
                                    <ArtistCard artist={artist} showSales={true} showViews={true} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
