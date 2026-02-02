import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Grid, List, Search, SlidersHorizontal } from "lucide-react"
import { useEffect } from "react"

interface SearchFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    viewMode: "grid" | "list"
    onViewModeChange: (mode: "grid" | "list") => void
    artworkCount: number
    sortBy?: string
    onSortChange?: (value: string) => void
    priceRange?: string
    onPriceRangeChange?: (value: string) => void
    medium?: string
    onMediumChange?: (value: string) => void
    rarity?: string
    onRarityChange?: (value: string) => void
}

export function SearchFilters({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    sortBy = "recommended",
    onSortChange,
    priceRange = "price",
    onPriceRangeChange,
    medium = "medium",
    onMediumChange,
    rarity = "rarity",
    onRarityChange
}: SearchFiltersProps) {
    // Inject a style tag to override any margin/padding
    useEffect(() => {
        const styleId = "prevent-select-margin"
        let styleElement = document.getElementById(styleId) as HTMLStyleElement

        if (!styleElement) {
            styleElement = document.createElement("style")
            styleElement.id = styleId
            styleElement.textContent = `
        body {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        html {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
      `
            document.head.appendChild(styleElement)
        }

        // Also use interval as backup
        const interval = setInterval(() => {
            const body = document.body
            const html = document.documentElement

            // Force remove margin-right and padding-right
            body.style.setProperty("margin-right", "0", "important")
            body.style.setProperty("padding-right", "0", "important")
            html.style.setProperty("margin-right", "0", "important")
            html.style.setProperty("padding-right", "0", "important")
        }, 16) // Check every frame (~60fps)

        return () => {
            clearInterval(interval)
            // Don't remove style element as it should persist
        }
    }, [])

    return (
        <section className="border-gray-200 border-t px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-center justify-between gap-4 lg:flex-row">
                    <div className="flex flex-1 items-center gap-4">
                        <div className="relative max-w-md flex-1">
                            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                            <Input
                                placeholder="Search artworks, artists, or galleries..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="rounded-full border-gray-300 pl-10"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            All Filters
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select
                            value={rarity}
                            onValueChange={onRarityChange}
                            {...({ modal: false } as any)}
                        >
                            <SelectTrigger className="h-10 w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                                <SelectValue placeholder="Rarity" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="z-[100]"
                                align="start"
                            >
                                <SelectItem value="rarity">Rarity</SelectItem>
                                <SelectItem value="common">Common</SelectItem>
                                <SelectItem value="rare">Rare</SelectItem>
                                <SelectItem value="unique">Unique</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={medium}
                            onValueChange={onMediumChange}
                            {...({ modal: false } as any)}
                        >
                            <SelectTrigger className="h-10 w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                                <SelectValue placeholder="Medium" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="z-[100]"
                                align="start"
                            >
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="painting">Painting</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="sculpture">Sculpture</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={priceRange}
                            onValueChange={onPriceRangeChange}
                            {...({ modal: false } as any)}
                        >
                            <SelectTrigger className="h-10 w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                                <SelectValue placeholder="Price Range" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="z-[100]"
                                align="start"
                            >
                                <SelectItem value="price">Price Range</SelectItem>
                                <SelectItem value="under-1k">Under $1,000</SelectItem>
                                <SelectItem value="1k-10k">$1,000 - $10,000</SelectItem>
                                <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                                <SelectItem value="over-50k">Over $50,000</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 border-l pl-4">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onViewModeChange("grid")}
                                className="bg-transparent hover:bg-transparent focus:bg-transparent"
                            >
                                <Grid className="h-4 w-4 text-neutral-600" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onViewModeChange("list")}
                                className="bg-transparent hover:bg-transparent focus:bg-transparent"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <Select
                            value={sortBy}
                            onValueChange={onSortChange}
                            {...({ modal: false } as any)}
                        >
                            <SelectTrigger className="h-10 w-48 rounded-full bg-transparent focus:ring-0 active:ring-0">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="z-[100]">
                                <SelectItem value="recommended">Sort: Recommended</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-8 flex items-center justify-between" />
            </div>
        </section>
    )
}
