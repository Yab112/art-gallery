import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Grid, List, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"



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
    medium?: string[]
    onMediumChange?: (values: string[]) => void
    origin?: string[]
    onOriginChange?: (values: string[]) => void
    condition?: string[]
    onConditionChange?: (values: string[]) => void
    categoryIds?: string[]
    onCategoryIdsChange?: (ids: string[]) => void
    categoriesData?: any
    onClearAll?: () => void
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
    medium = [],
    onMediumChange,
    origin = [],
    onOriginChange,
    condition = [],
    onConditionChange,
    categoryIds = [],
    onCategoryIdsChange,
    categoriesData,
    onClearAll
}: SearchFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)

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

    const toggleSelection = (
        currentValues: string[],
        value: string,
        onChange?: (values: string[]) => void
    ) => {
        if (!onChange) return
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value]
        onChange(newValues)
    }

    const hasAnyFilter =
        searchQuery ||
        priceRange !== "price" ||
        medium.length > 0 ||
        origin.length > 0 ||
        condition.length > 0 ||
        categoryIds.length > 0

    const getCategoryName = (id: string) => {
        if (!categoriesData?.data) return id
        const category = categoriesData.data.find((c: any) => c.id === id)
        return category ? category.name : id
    }

    return (
        <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar pb-10">
                {/* ACTIVE FILTER CHIPS IN SIDEBAR */}
                {hasAnyFilter && (
                    <div className="space-y-3 pb-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Filters</span>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={onClearAll}
                                className="text-[11px] text-red-600 hover:text-red-700 p-0 h-auto"
                            >
                                Clear all
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {searchQuery && (
                                <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    Search: {searchQuery}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => onSearchChange("")} />
                                </Badge>
                            )}
                            
                            {priceRange !== "price" && (
                                <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    Price: {priceRange}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => onPriceRangeChange?.("price")} />
                                </Badge>
                            )}

                            {medium.map((m) => (
                                <Badge key={m} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    {m}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleSelection(medium, m, onMediumChange)} />
                                </Badge>
                            ))}

                            {origin.map((o) => (
                                <Badge key={o} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    {o}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleSelection(origin, o, onOriginChange)} />
                                </Badge>
                            ))}

                            {condition.map((c) => (
                                <Badge key={c} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    {c}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleSelection(condition, c, onConditionChange)} />
                                </Badge>
                            ))}

                            {categoryIds.map((id) => (
                                <Badge key={id} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px] gap-1">
                                    {getCategoryName(id)}
                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleSelection(categoryIds, id, onCategoryIdsChange)} />
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEARCH BAR IN SIDEBAR */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Search</h3>
                    <div className="relative w-full">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3.5 h-3.5 w-3.5 transform text-gray-400" />
                        <Input
                            placeholder="Artist, title..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 w-full rounded-xl border-gray-200 bg-gray-50/50 pl-10 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <Accordion type="multiple" defaultValue={["price", "medium", "origin", "condition"]} className="w-full space-y-4">
                        {/* Price Filter */}
                        <AccordionItem value="price" className="border-none">
                            <AccordionTrigger className="text-xs font-bold text-gray-900 uppercase tracking-wider py-2 hover:no-underline hover:text-red-700">Price Range</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2 pt-2">
                                    {[
                                        { value: "price", label: "All Prices" },
                                        { value: "under-1k", label: "Under $1,000" },
                                        { value: "1k-10k", label: "$1,000 - $10,000" },
                                        { value: "10k-50k", label: "$10,000 - $50,000" },
                                        { value: "over-50k", label: "Over $50,000" }
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`price-${option.value}`}
                                                checked={priceRange === option.value}
                                                onCheckedChange={() => onPriceRangeChange?.(option.value)}
                                            />
                                            <Label htmlFor={`price-${option.value}`} className="text-sm font-normal cursor-pointer text-gray-600">
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Support / Medium Filter */}
                        <AccordionItem value="medium" className="border-none">
                            <AccordionTrigger className="text-xs font-bold text-gray-900 uppercase tracking-wider py-2 hover:no-underline hover:text-red-700">Support (Medium)</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2 pt-2">
                                    {[
                                        { value: "Canvas", label: "Canvas" },
                                        { value: "Paper", label: "Paper" },
                                        { value: "Wood", label: "Wood" },
                                        { value: "Metal", label: "Metal" },
                                        { value: "Fabric", label: "Fabric" },
                                        { value: "Stone", label: "Stone" }
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`medium-${option.value}`}
                                                checked={medium.includes(option.value)}
                                                onCheckedChange={() => toggleSelection(medium, option.value, onMediumChange)}
                                            />
                                            <Label htmlFor={`medium-${option.value}`} className="text-sm font-normal cursor-pointer text-gray-600">
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Origin Filter */}
                        <AccordionItem value="origin" className="border-none">
                            <AccordionTrigger className="text-xs font-bold text-gray-900 uppercase tracking-wider py-2 hover:no-underline hover:text-red-700">Origin</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2 pt-2">
                                    {[
                                        { value: "artist", label: "From Artist" },
                                        { value: "gallery", label: "Gallery" },
                                        { value: "private", label: "Private Collection" },
                                        { value: "USA", label: "USA" },
                                        { value: "UK", label: "UK" },
                                        { value: "France", label: "France" },
                                        { value: "Germany", label: "Germany" },
                                        { value: "Italy", label: "Italy" },
                                        { value: "Spain", label: "Spain" },
                                        { value: "Japan", label: "Japan" },
                                        { value: "Ethiopia", label: "Ethiopia" }
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`origin-${option.value}`}
                                                checked={origin.includes(option.value)}
                                                onCheckedChange={() => toggleSelection(origin, option.value, onOriginChange)}
                                            />
                                            <Label htmlFor={`origin-${option.value}`} className="text-sm font-normal cursor-pointer text-gray-600">
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Condition Filter */}
                        <AccordionItem value="condition" className="border-none">
                            <AccordionTrigger className="text-xs font-bold text-gray-900 uppercase tracking-wider py-2 hover:no-underline hover:text-red-700">Condition</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2 pt-2">
                                    {[
                                        { value: "Excellent", label: "Excellent" },
                                        { value: "Very Good", label: "Very Good" },
                                        { value: "Good", label: "Good" },
                                        { value: "Mint", label: "Mint" },
                                        { value: "Fine", label: "Fine" },
                                        { value: "fair", label: "Fair" }
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`condition-${option.value}`}
                                                checked={condition.includes(option.value)}
                                                onCheckedChange={() => toggleSelection(condition, option.value, onConditionChange)}
                                            />
                                            <Label htmlFor={`condition-${option.value}`} className="text-sm font-normal cursor-pointer text-gray-600">
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                </Accordion>
            </div>
        </aside>
    )
}
