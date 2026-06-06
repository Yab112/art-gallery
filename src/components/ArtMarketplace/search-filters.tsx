import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll"

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
    isOpen?: boolean
    onClose?: () => void
}

export function SearchFilters({
    searchQuery,
    onSearchChange,
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
    onClearAll,
    isOpen = false,
    onClose
}: SearchFiltersProps) {
    useLockBodyScroll(isOpen, "(max-width: 1023px)")

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
        if (!categoriesData) return id
        const categories = Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.categories || []

        const category = categories.find((c: any) => c.id === id)
        return category ? category.name : id
    }

    if (!isOpen) return null

    return (
        <>
            <button
                type="button"
                aria-label="Close filters"
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
                onClick={onClose}
            />

            <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,18rem)] flex-col overflow-hidden border-gray-200 border-r bg-white shadow-xl overscroll-contain lg:static lg:z-auto lg:w-56 lg:flex-shrink-0 lg:overflow-visible lg:shadow-none">
                <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900 text-sm">Filters</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 custom-scrollbar">
                    {hasAnyFilter && (
                        <div className="space-y-2 border-gray-100 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px] text-gray-900 uppercase tracking-wider">
                                    Active
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={onClearAll}
                                    className="h-auto p-0 text-[11px] text-red-600 hover:text-red-700"
                                >
                                    Clear all
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {searchQuery && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {searchQuery}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() => onSearchChange("")}
                                        />
                                    </Badge>
                                )}
                                {priceRange !== "price" && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {priceRange}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() => onPriceRangeChange?.("price")}
                                        />
                                    </Badge>
                                )}
                                {medium.map((m) => (
                                    <Badge
                                        key={m}
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {m}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() => toggleSelection(medium, m, onMediumChange)}
                                        />
                                    </Badge>
                                ))}
                                {origin.map((o) => (
                                    <Badge
                                        key={o}
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {o}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() => toggleSelection(origin, o, onOriginChange)}
                                        />
                                    </Badge>
                                ))}
                                {condition.map((c) => (
                                    <Badge
                                        key={c}
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {c}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() =>
                                                toggleSelection(condition, c, onConditionChange)
                                            }
                                        />
                                    </Badge>
                                ))}
                                {categoryIds.map((id) => (
                                    <Badge
                                        key={id}
                                        variant="secondary"
                                        className="gap-1 border-none bg-red-50 px-2 py-0.5 text-[10px] text-red-700"
                                    >
                                        {getCategoryName(id)}
                                        <X
                                            className="h-2.5 w-2.5 cursor-pointer"
                                            onClick={() =>
                                                toggleSelection(categoryIds, id, onCategoryIdsChange)
                                            }
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="font-bold text-[10px] text-gray-900 uppercase tracking-wider">
                            Search
                        </h3>
                        <div className="relative w-full">
                            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Artist, title..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 pl-9 text-sm focus:bg-white focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    <Accordion type="multiple" className="w-full space-y-1">
                        <AccordionItem value="price" className="border-none">
                            <AccordionTrigger className="py-2 font-bold text-[10px] text-gray-900 uppercase tracking-wider hover:text-red-700 hover:no-underline">
                                Price Range
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-1.5 pt-1">
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
                                                onCheckedChange={() =>
                                                    onPriceRangeChange?.(option.value)
                                                }
                                            />
                                            <Label
                                                htmlFor={`price-${option.value}`}
                                                className="cursor-pointer font-normal text-gray-600 text-sm"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="medium" className="border-none">
                            <AccordionTrigger className="py-2 font-bold text-[10px] text-gray-900 uppercase tracking-wider hover:text-red-700 hover:no-underline">
                                Support
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-1.5 pt-1">
                                    {["Canvas", "Paper", "Wood", "Metal", "Fabric", "Stone"].map(
                                        (option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`medium-${option}`}
                                                    checked={medium.includes(option)}
                                                    onCheckedChange={() =>
                                                        toggleSelection(medium, option, onMediumChange)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`medium-${option}`}
                                                    className="cursor-pointer font-normal text-gray-600 text-sm"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        )
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="origin" className="border-none">
                            <AccordionTrigger className="py-2 font-bold text-[10px] text-gray-900 uppercase tracking-wider hover:text-red-700 hover:no-underline">
                                Origin
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-1.5 pt-1">
                                    {[
                                        "artist",
                                        "gallery",
                                        "private",
                                        "USA",
                                        "UK",
                                        "France",
                                        "Germany",
                                        "Italy",
                                        "Spain",
                                        "Japan",
                                        "Ethiopia"
                                    ].map((option) => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`origin-${option}`}
                                                checked={origin.includes(option)}
                                                onCheckedChange={() =>
                                                    toggleSelection(origin, option, onOriginChange)
                                                }
                                            />
                                            <Label
                                                htmlFor={`origin-${option}`}
                                                className="cursor-pointer font-normal text-gray-600 text-sm capitalize"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="condition" className="border-none">
                            <AccordionTrigger className="py-2 font-bold text-[10px] text-gray-900 uppercase tracking-wider hover:text-red-700 hover:no-underline">
                                Condition
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-1.5 pt-1">
                                    {[
                                        "Excellent",
                                        "Very Good",
                                        "Good",
                                        "Mint",
                                        "Fine",
                                        "fair"
                                    ].map((option) => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`condition-${option}`}
                                                checked={condition.includes(option)}
                                                onCheckedChange={() =>
                                                    toggleSelection(condition, option, onConditionChange)
                                                }
                                            />
                                            <Label
                                                htmlFor={`condition-${option}`}
                                                className="cursor-pointer font-normal text-gray-600 text-sm"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </aside>
        </>
    )
}
