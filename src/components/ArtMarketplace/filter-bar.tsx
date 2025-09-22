
import { ChevronDown, Filter, LayoutGrid } from "lucide-react"
import { Button } from "../ui/button"

interface FilterBarProps {
  totalCount: number
}

export function FilterBar({ totalCount }: FilterBarProps) {
  return (
    <div className="border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            All Filters
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            Rarity
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            Medium
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            Price Range
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-1">
            <LayoutGrid className="h-4 w-4" />
            Sort: Recommended
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">{totalCount.toLocaleString()} Artworks:</p>
      </div>
    </div>
  )
}
