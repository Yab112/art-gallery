"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Filter, ChevronDown, ArrowUpDown } from "lucide-react"
import { useState } from "react"

export function FilterControls() {
  const [filters, setFilters] = useState({
    rarity: "All",
    medium: "All",
    availability: "All",
    sort: "Recommended",
  })

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      {/* Left side controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Bell className="h-4 w-4" />
          Create Alert
        </Button>

        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          All Filters
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              Medium
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All</DropdownMenuItem>
            <DropdownMenuItem>Painting</DropdownMenuItem>
            <DropdownMenuItem>Photography</DropdownMenuItem>
            <DropdownMenuItem>Sculpture</DropdownMenuItem>
            <DropdownMenuItem>Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              Availability
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All</DropdownMenuItem>
            <DropdownMenuItem>Available</DropdownMenuItem>
            <DropdownMenuItem>Sold</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowUpDown className="h-4 w-4" />
            Sort: {filters.sort}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: "Recommended" })}>
            Recommended
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: "Price: Low to High" })}>
            Price: Low to High
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: "Price: High to Low" })}>
            Price: High to Low
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: "Recently Added" })}>
            Recently Added
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: "Year: Newest First" })}>
            Year: Newest First
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
