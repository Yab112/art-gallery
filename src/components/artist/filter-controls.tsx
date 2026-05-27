import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, Bell, ChevronDown, Filter } from "lucide-react"
import { useState } from "react"

interface FilterControlsProps {
    sortBy?: string
    onSortChange?: (value: string) => void
    priceRange?: string
    onPriceRangeChange?: (value: string) => void
    medium?: string
    onMediumChange?: (value: string) => void
    status?: string
    onStatusChange?: (value: string) => void
    openMenu?: string | null
    onOpenChange?: (value: string | null) => void
}

export function FilterControls({
    sortBy = "recommended",
    onSortChange,
    onMediumChange,
    onStatusChange,
    openMenu: externalOpenMenu,
    onOpenChange: externalOnOpenChange
}: FilterControlsProps) {
    const [internalOpenMenu, setInternalOpenMenu] = useState<string | null>(null)

    const openMenu = externalOpenMenu !== undefined ? externalOpenMenu : internalOpenMenu
    const setOpenMenu = (value: string | null) => {
        if (externalOnOpenChange) {
            externalOnOpenChange(value)
        } else {
            setInternalOpenMenu(value)
        }
    }

    const getSortLabel = (value: string) => {
        switch (value) {
            case "price-low":
                return "Price: Low to High"
            case "price-high":
                return "Price: High to Low"
            case "newest":
                return "Recently Added"
            case "oldest":
                return "Oldest First"
            case "recommended":
            default:
                return "Recommended"
        }
    }

    return (
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Left side controls */}
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                    <Bell className="h-4 w-4" />
                    Create Alert
                </Button>

                <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                    <Filter className="h-4 w-4" />
                    All Filters
                </Button>

                <DropdownMenu
                    open={openMenu === "rarity"}
                    onOpenChange={(open) => setOpenMenu(open ? "rarity" : null)}
                >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                            Rarity
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All</DropdownMenuItem>
                        <DropdownMenuItem>Unique</DropdownMenuItem>
                        <DropdownMenuItem>Limited Edition</DropdownMenuItem>
                        <DropdownMenuItem>Open Edition</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu
                    open={openMenu === "medium"}
                    onOpenChange={(open) => setOpenMenu(open ? "medium" : null)}
                >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                            Medium
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onMediumChange?.("")}>
                            All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMediumChange?.("painting")}>
                            Painting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMediumChange?.("photography")}>
                            Photography
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMediumChange?.("sculpture")}>
                            Sculpture
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMediumChange?.("print")}>
                            Print
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu
                    open={openMenu === "availability"}
                    onOpenChange={(open) => setOpenMenu(open ? "availability" : null)}
                >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                            Availability
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onStatusChange?.("APPROVED")}>
                            Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.("SOLD")}>
                            Sold
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.("APPROVED")}>
                            All
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Right side sort */}
            <DropdownMenu
                open={openMenu === "sort"}
                onOpenChange={(open) => setOpenMenu(open ? "sort" : null)}
            >
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                        <ArrowUpDown className="h-4 w-4" />
                        Sort: {getSortLabel(sortBy)}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSortChange?.("recommended")}>
                        Recommended
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange?.("price-low")}>
                        Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange?.("price-high")}>
                        Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange?.("newest")}>
                        Recently Added
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange?.("oldest")}>
                        Oldest First
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
