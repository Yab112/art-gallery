import { ArtworkCard } from "@/components/artwork-card"
import { SectionTitle } from "@/components/section-title"
import { Button } from "@/components/ui/button"
import { mapArtworkToCardProps } from "@/lib/utils/artwork-mapper"
import { useArtworks } from "@/queries/artworkQueries"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useRef, useState } from "react"

export function NewArrivals() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [hasDragged, setHasDragged] = useState(false)

    // Fetch recently created approved artworks (limit to 8 for display)
    const { data: artworksData, isLoading } = useArtworks({
        limit: 8,
        page: 1,
        isApproved: true,
        sortBy: "createdAt",
        orderBy: "desc"
    })

    const newArtworks = useMemo(() => {
        if (!artworksData?.artworks) return []
        // Limit to 8 artworks for the new arrivals section
        return artworksData.artworks.slice(0, 8).map(mapArtworkToCardProps)
    }, [artworksData])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 320 // Width of one card plus gap
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

    const handleFavorite = (id: string) => {
        console.log("Added to favorites:", id)
        // Add favorite logic here
    }

    const handleSearch = (id: string) => {
        console.log("Search artwork:", id)
        // Add search logic here
    }

    if (isLoading) {
        return (
            <section className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="NEW ARRIVALS"
                        subtitle="The latest arrivals"
                        className="mb-8"
                    />
                    <div className="flex gap-8 overflow-x-auto">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-80 flex-shrink-0 animate-pulse">
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

    if (!newArtworks || newArtworks.length === 0) {
        return (
            <section className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        title="NEW ARRIVALS"
                        subtitle="The latest arrivals"
                        className="mb-8"
                    />
                    <p className="text-center text-gray-500">No new arrivals at the moment.</p>
                </div>
            </section>
        )
    }

    return (
        <section className="px-4 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="relative mb-12">
                    <SectionTitle
                        title="NEW ARRIVALS"
                        subtitle="The latest arrivals"
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

                {/* Horizontal Scrollable Artworks */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="scrollbar-hide flex cursor-grab gap-8 overflow-x-auto px-2 active:cursor-grabbing"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {newArtworks.map((artwork) => (
                            <div
                                key={artwork.id}
                                className="w-80 flex-shrink-0"
                                onClick={(e) => {
                                    // Prevent navigation if user was dragging
                                    if (hasDragged) {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }
                                }}
                            >
                                <ArtworkCard
                                    {...artwork}
                                    onFavorite={handleFavorite}
                                    onSearch={handleSearch}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
