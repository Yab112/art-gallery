"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid, List, Search, SlidersHorizontal } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  artworkCount: number;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  artworkCount,
}: SearchFiltersProps) {
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
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              All Filters
            </Button>
          </div>

          <div className="flex items-center gap-4 ">
            <Select defaultValue="rarity">
              <SelectTrigger className="w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarity">Rarity</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="unique">Unique</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="medium">
              <SelectTrigger className="w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="price">
              <SelectTrigger className="w-32 rounded-full bg-transparent focus:ring-0 active:ring-0">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
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

            <Select defaultValue="recommended">
              <SelectTrigger className="w-48 rounded-full bg-transparent focus:ring-0 active:ring-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Sort: Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <p className="text-gray-600">
            {artworkCount.toLocaleString()} Artworks
          </p>
        </div>
      </div>
    </section>
  );
}
