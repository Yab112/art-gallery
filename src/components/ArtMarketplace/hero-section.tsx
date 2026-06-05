import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

interface HeroCategory {
    id: string
    name: string
    image: string
    count: string
}

interface MarketplaceHeroProps {
    eyebrow?: string
    title: string
    subtitle: string
    buttonText: string
    onButtonClick?: () => void
    categories?: HeroCategory[]
    onCategorySelect?: (categoryId: string) => void
    selectedCategoryIds?: string[]
    isLoadingCategories?: boolean
}

export function MarketplaceHero({
    eyebrow = "Art marketplace",
    title,
    subtitle,
    buttonText,
    onButtonClick,
    categories = [],
    onCategorySelect,
    selectedCategoryIds = [],
    isLoadingCategories = false
}: MarketplaceHeroProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const hasMovedRef = useRef(false)

    const scroll = (direction: "left" | "right") => {
        scrollRef.current?.scrollBy({
            left: direction === "left" ? -280 : 280,
            behavior: "smooth"
        })
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        hasMovedRef.current = false
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        setTimeout(() => {
            hasMovedRef.current = false
        }, 100)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        if (Math.abs(walk) > 5) hasMovedRef.current = true
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    return (
        <section className="border-gray-100 border-b bg-gradient-to-b from-stone-50 to-white px-3 pt-5 pb-6 sm:px-4 sm:pt-6 sm:pb-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-2 font-semibold text-[11px] text-red-700 uppercase tracking-[0.22em]">
                            {eyebrow}
                        </p>
                        <h1 className="font-poppins font-semibold text-[1.85rem] text-gray-900 leading-[1.15] tracking-tight sm:text-[2.35rem]">
                            {title}
                        </h1>
                        <p className="mt-2.5 max-w-lg text-[15px] text-gray-600 leading-relaxed sm:text-base">
                            {subtitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onButtonClick}
                        className="group inline-flex items-center self-start border-gray-900 border-b-2 pb-0.5 font-medium text-gray-900 text-sm transition-colors hover:border-red-700 hover:text-red-700 sm:self-auto"
                    >
                        {buttonText}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {isLoadingCategories ? (
                    <div className="flex gap-3 overflow-hidden px-1 py-2 sm:gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-40 flex-shrink-0 animate-pulse sm:w-48">
                                <div className="aspect-[4/3] rounded-xl bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="relative sm:px-10">
                        <Button
                            variant="outline"
                            size="icon"
                            className="-translate-y-1/2 absolute top-[calc(50%-0.25rem)] left-0 z-10 hidden h-8 w-8 rounded-full bg-white shadow-md sm:flex"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="-translate-y-1/2 absolute top-[calc(50%-0.25rem)] right-0 z-10 hidden h-8 w-8 rounded-full bg-white shadow-md sm:flex"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <div
                            ref={scrollRef}
                            className="scrollbar-hide -mx-1 flex cursor-grab gap-3 overflow-x-auto px-1 py-2 active:cursor-grabbing sm:gap-4"
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseUp}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                        >
                            {categories.map((category) => {
                                const isSelected = selectedCategoryIds.includes(category.id)
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className="group w-40 flex-shrink-0 text-left sm:w-48"
                                        onClick={() => {
                                            if (!hasMovedRef.current) {
                                                onCategorySelect?.(category.id)
                                            }
                                        }}
                                    >
                                        <div
                                            className={`relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-all duration-300 ${
                                                isSelected
                                                    ? "shadow-md ring-2 ring-red-600"
                                                    : "group-hover:shadow-md"
                                            }`}
                                        >
                                            <img
                                                src={category.image || "/placeholder.svg"}
                                                alt={category.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                            <div
                                                className={`absolute inset-0 transition-colors ${
                                                    isSelected
                                                        ? "bg-red-900/30"
                                                        : "bg-gradient-to-t from-black/50 via-black/10 to-transparent group-hover:from-black/60"
                                                }`}
                                            />
                                            <div className="absolute right-2 bottom-2 left-2">
                                                <p className="truncate font-semibold text-white text-xs drop-shadow sm:text-sm">
                                                    {category.name}
                                                </p>
                                                <p className="text-[10px] text-white/80 sm:text-xs">
                                                    {category.count} works
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    )
}

/** @deprecated Use MarketplaceHero */
export function SectionTitleHero(props: MarketplaceHeroProps) {
    return <MarketplaceHero {...props} />
}
