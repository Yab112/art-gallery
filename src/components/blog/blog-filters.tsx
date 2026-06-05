import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { useEffect } from "react";

interface BlogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  authorId?: string;
  onAuthorChange?: (value: string) => void;
  authors?: Array<{ id: string; name: string }>;
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
  authors = [],
}: BlogFiltersProps) {
  // Fix for Radix UI Select dropdown page shift issue
  useEffect(() => {
    const styleId = "prevent-select-margin-blog";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
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
      `;
      document.head.appendChild(styleElement);
    }

    // Use interval as backup
    const interval = setInterval(() => {
      const body = document.body;
      const html = document.documentElement;

      // Force remove margin-right and padding-right
      body.style.setProperty("margin-right", "0", "important");
      body.style.setProperty("padding-right", "0", "important");
      html.style.setProperty("margin-right", "0", "important");
      html.style.setProperty("padding-right", "0", "important");
    }, 16); // Check every frame (~60fps)

    return () => {
      clearInterval(interval);
    };
  }, []);

  const clearFilters = () => {
    onSearchChange("");
    onSortChange("createdAt");
    onSortOrderChange("desc");
    onAuthorChange?.("");
  };

  const hasActiveFilters =
    searchQuery || sortBy !== "createdAt" || sortOrder !== "desc" || authorId;

  return (
    <div className="flex flex-col items-center justify-between gap-8 border-gray-100 border-b pb-8 md:flex-row">
      <div className="flex w-full flex-1 items-center gap-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full border-b border-gray-200 bg-transparent py-2 pl-4 text-lg placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-red-700 transition-colors shadow-none"
            style={{ borderTop: "0", borderLeft: "0", borderRight: "0" }}
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex w-full items-center gap-6 md:w-auto">
        {/* Simplified Sort */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400 uppercase tracking-widest">Sort:</span>
          <Select
            value={sortBy}
            onValueChange={onSortChange}
            {...({ modal: false } as any)}
          >
            <SelectTrigger className="h-8 border-none bg-transparent p-0 font-bold focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={8}
              className="border-gray-100 shadow-xl"
            >
              <SelectItem value="createdAt">Latest</SelectItem>
              <SelectItem value="views">Popular</SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Author */}
        {authors.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400 uppercase tracking-widest">
              From:
            </span>
            <Select
              value={authorId || "all"}
              onValueChange={(value) =>
                onAuthorChange?.(value === "all" ? "" : value)
              }
              {...({ modal: false } as any)}
            >
              <SelectTrigger className="h-8 border-none bg-transparent p-0 font-bold focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className="border-gray-100 shadow-xl"
              >
                <SelectItem value="all">Everyone</SelectItem>
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
  );
}
