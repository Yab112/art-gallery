import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Calendar, Filter, Search, X } from "lucide-react"
import { useEffect } from "react"

interface MyBlogsFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    statusFilter: "all" | "published" | "pending" | "draft"
    onStatusChange: (value: "all" | "published" | "pending" | "draft") => void
    sortBy: string
    onSortChange: (value: string) => void
    sortOrder: string
    onSortOrderChange: (value: string) => void
    dateRange?: string
    onDateRangeChange?: (value: string) => void
}

export function MyBlogsFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    dateRange = "all",
    onDateRangeChange
}: MyBlogsFiltersProps) {
    // Fix for Radix UI Select dropdown page shift issue
    useEffect(() => {
        const styleId = "prevent-select-margin-my-blogs"
        let styleElement = document.getElementById(styleId) as HTMLStyleElement

        if (!styleElement) {
            styleElement = document.createElement("style")
            styleElement.id = styleId
            styleElement.textContent = `
        body[data-scroll-locked],
        html[data-scroll-locked],
        body[data-radix-scroll-lock],
        html[data-radix-scroll-lock] {
          margin-right: 0 !important;
          margin-left: 0 !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        }
      `
            document.head.appendChild(styleElement)
        }

        const interval = setInterval(() => {
            const body = document.body
            const html = document.documentElement
            body.style.setProperty("margin-right", "0", "important")
            body.style.setProperty("padding-right", "0", "important")
            html.style.setProperty("margin-right", "0", "important")
            html.style.setProperty("padding-right", "0", "important")
        }, 16)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const clearFilters = () => {
        onSearchChange("")
        onStatusChange("all")
        onSortChange("createdAt")
        onSortOrderChange("desc")
        onDateRangeChange?.("all")
    }

    const hasActiveFilters =
        searchQuery ||
        statusFilter !== "all" ||
        sortBy !== "createdAt" ||
        sortOrder !== "desc" ||
        dateRange !== "all"

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
                    <Filter className="h-5 w-5" />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-700 hover:text-red-800"
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                    <label className="font-medium text-gray-700 text-sm">Search by Title</label>
                    <div className="relative">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search blog posts..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 pl-10"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="font-medium text-gray-700 text-sm">Status</label>
                    <Select
                        value={statusFilter}
                        onValueChange={(value: "all" | "published" | "pending" | "draft") =>
                            onStatusChange(value)
                        }
                        {...({ modal: false } as any)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="draft">Drafts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-gray-700 text-sm">
                        <Calendar className="h-4 w-4" />
                        Date Range
                    </label>
                    <Select
                        value={dateRange}
                        onValueChange={(value) => onDateRangeChange?.(value)}
                        {...({ modal: false } as any)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                    <label className="font-medium text-gray-700 text-sm">Sort By</label>
                    <Select
                        value={sortBy}
                        onValueChange={onSortChange}
                        {...({ modal: false } as any)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="createdAt">Date Created</SelectItem>
                            <SelectItem value="updatedAt">Last Updated</SelectItem>
                            <SelectItem value="publishedAt">Date Published</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="views">Most Viewed</SelectItem>
                            <SelectItem value="likes">Most Liked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                    <label className="font-medium text-gray-700 text-sm">Order</label>
                    <Select
                        value={sortOrder}
                        onValueChange={onSortOrderChange}
                        {...({ modal: false } as any)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
