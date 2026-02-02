import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Filter, Search, X } from "lucide-react"
import { useEffect } from "react"

interface BlogFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    sortBy: string
    onSortChange: (value: string) => void
    sortOrder: string
    onSortOrderChange: (value: string) => void
    authorId?: string
    onAuthorChange?: (value: string) => void
    authors?: Array<{ id: string; name: string }>
}

export function BlogFilters({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    authorId,
    onAuthorChange,
    authors = []
}: BlogFiltersProps) {
    // Fix for Radix UI Select dropdown page shift issue
    useEffect(() => {
        const styleId = "prevent-select-margin-blog"
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

        // Use interval as backup
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
        }
    }, [])

    const clearFilters = () => {
        onSearchChange("")
        onSortChange("createdAt")
        onSortOrderChange("desc")
        onAuthorChange?.("")
    }

    const hasActiveFilters =
        searchQuery || sortBy !== "createdAt" || sortOrder !== "desc" || authorId

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
                    <label className="font-medium text-gray-700 text-sm">Search</label>
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
                            <SelectItem value="views">Most Viewed</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
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
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="desc">Descending (Newest/High to Low)</SelectItem>
                            <SelectItem value="asc">Ascending (Oldest/Low to High)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Author Filter */}
                {authors.length > 0 && (
                    <div className="space-y-2">
                        <label className="font-medium text-gray-700 text-sm">Author</label>
                        <Select
                            value={authorId || "all"}
                            onValueChange={(value) =>
                                onAuthorChange?.(value === "all" ? "" : value)
                            }
                            {...({ modal: false } as any)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All Authors" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4}>
                                <SelectItem value="all">All Authors</SelectItem>
                                {authors.map((author) => (
                                    <SelectItem key={author.id} value={author.id}>
                                        {author.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    )
}
