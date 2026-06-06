import { ArtistCard } from "@/components/artist/artist-circle-card"
import { Button } from "@/components/ui/button"
import { useGetAllArtistsInfinite } from "@/services/artist/useGetAllArtistsInfinite"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SectionTitle } from "../section-title"

const PAGE_SIZE = 12
const AUTO_SCROLL_SPEED = 0.6

export function TrendingArtists() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const isPausedRef = useRef(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [hasDragged, setHasDragged] = useState(false)

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useGetAllArtistsInfinite(PAGE_SIZE)

    const artists = useMemo(() => {
        const seen = new Set<string>()
        const merged = []

        for (const page of data?.pages ?? []) {
            for (const artist of page.artists ?? []) {
                if (!seen.has(artist.id)) {
                    seen.add(artist.id)
                    merged.push(artist)
                }
            }
        }

        return merged.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    }, [data])

    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    useEffect(() => {
        isPausedRef.current = isDragging || isHovered
    }, [isDragging, isHovered])

    // Auto-scroll horizontally
    useEffect(() => {
        const container = scrollRef.current
        if (!container || artists.length === 0) return

        let animationId = 0

        const tick = () => {
            const el = scrollRef.current
            if (el && !isPausedRef.current) {
                const maxScroll = el.scrollWidth - el.clientWidth

                if (maxScroll > 0) {
                    if (el.scrollLeft >= maxScroll - 2) {
                        if (hasNextPage && !isFetchingNextPage) {
                            loadMore()
                        } else if (!hasNextPage) {
                            el.scrollLeft = 0
                        }
                    } else {
                        el.scrollLeft += AUTO_SCROLL_SPEED
                    }

                    if (maxScroll - el.scrollLeft - el.clientWidth < 400) {
                        loadMore()
                    }
                }
            }

            animationId = requestAnimationFrame(tick)
        }

        animationId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(animationId)
    }, [artists.length, hasNextPage, isFetchingNextPage, loadMore])

    // Horizontal infinite scroll — sentinel enters the scroll container viewport
    useEffect(() => {
        const root = scrollRef.current
        const target = loadMoreRef.current
        if (!root || !target) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMore()
                }
            },
            { root, rootMargin: "0px 120px 0px 0px", threshold: 0.01 },
        )

        observer.observe(target)
        return () => observer.disconnect()
    }, [loadMore, artists.length, hasNextPage, isFetchingNextPage])

    // Backup: scroll event on the horizontal track
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container
            if (scrollWidth - scrollLeft - clientWidth < 400) {
                loadMore()
            }
        }

        container.addEventListener("scroll", handleScroll, { passive: true })
        return () => container.removeEventListener("scroll", handleScroll)
    }, [loadMore])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = 280
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })
        if (direction === "right") {
            setTimeout(loadMore, 300)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return
        isPausedRef.current = true
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
        const walk = (x - startX) * 2
        scrollRef.current.scrollLeft = scrollLeft - walk
        if (Math.abs(walk) > 5) {
            setHasDragged(true)
        }
    }

    const endDrag = () => {
        if (!scrollRef.current) return
        setIsDragging(false)
        scrollRef.current.style.cursor = "grab"
        scrollRef.current.style.userSelect = "auto"
        setTimeout(() => setHasDragged(false), 100)

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        if (scrollWidth - scrollLeft - clientWidth < 400) {
            loadMore()
        }
    }

    const mappedArtists = artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        email: artist.email,
        country: artist.country || "Unknown",
        followers: 0,
        artworks: artist.artworks || 0,
        avatar: artist.avatar || "/placeholder.svg",
        sales: artist.sales || 0,
        views: artist.views || 0,
        rating: (artist.salesCount || 0) > 0 ? 4.5 : undefined,
        isTopSelling: (artist.salesCount || 0) > 0,
        isMostViewed: (artist.views || 0) > 100,
        talentTypes: artist.talentTypes || [],
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
                                <div className="rounded-lg border bg-white p-4">
                                    <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gray-200" />
                                    <div className="mx-auto mb-2 h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="mx-auto h-3 w-1/2 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!artists.length) {
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
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="relative mb-10">
                    <SectionTitle
                        title="TRENDING ARTISTS"
                        subtitle="Discover popular creators"
                        className="mb-8"
                    />

                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 left-0 z-10 rounded-full bg-white/90"
                        onClick={() => scroll("left")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 right-0 z-10 rounded-full bg-white/90"
                        onClick={() => scroll("right")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="scrollbar-hide flex cursor-grab gap-4 overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:px-6 lg:px-8"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false)
                    endDrag()
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrag}
            >
                {mappedArtists.map((artist) => (
                    <div
                        key={artist.id}
                        className="w-64 flex-shrink-0"
                        onClickCapture={(e) => {
                            if (hasDragged) {
                                e.preventDefault()
                                e.stopPropagation()
                            }
                        }}
                    >
                        <ArtistCard artist={artist} showSales={true} showViews={true} />
                    </div>
                ))}

                {/* Horizontal infinite scroll sentinel */}
                <div
                    ref={loadMoreRef}
                    className="flex w-16 flex-shrink-0 items-center justify-center"
                    aria-hidden="true"
                />

                {isFetchingNextPage && (
                    <div className="flex w-64 flex-shrink-0 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-red-700" />
                    </div>
                )}
            </div>
        </section>
    )
}
