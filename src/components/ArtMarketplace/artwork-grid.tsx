import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";

interface Artwork {
  id: string;
  image: string;
  title: string;
  artist: string;
  price: string;
  year: string;
  medium: string;
  dimensions: string;
  seller: string;
}

interface ArtworkGridProps {
  artworks: Artwork[];
  viewMode: "grid" | "list";
  onFavorite: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isSelectionMode?: boolean;
  selectedArtworkIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

export function ArtworkGrid({
  artworks,
  viewMode,
  onFavorite,
  currentPage,
  totalPages,
  onPageChange,
  isSelectionMode = false,
  selectedArtworkIds = new Set(),
  onToggleSelection,
}: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <section className="px-4 min-h-[500px] flex items-center">
        <div className="mx-auto max-w-7xl w-full">
          <EmptyState
            icon={Palette}
            title="No Artworks Found"
            description="We couldn't find any artworks matching your search. Try adjusting your filters or browse our collections."
            actionLabel="Browse Collections"   
            onAction={() => {
              // Navigate to collections or clear filters
              window.location.href = "/";
            }}
          />
        </div>
      </section>
    );
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const safeTotalPages = totalPages ?? 1;
    const safeCurrentPage = currentPage ?? 1;
    if (!safeTotalPages || !safeCurrentPage) return [];
    
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (safeTotalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (safeCurrentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current page
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (safeCurrentPage < safeTotalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(safeTotalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const safeTotalPages = totalPages ?? 1;
  const safeCurrentPage = currentPage ?? 1;

  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl">
        <div
          className={`grid gap-8 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {artworks.map((artwork) => (
            <div key={artwork.id} className="group relative">
              {isSelectionMode && (
                <div className="absolute top-2 left-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelection?.(artwork.id);
                    }}
                    className="bg-white rounded-md p-1.5 shadow-md hover:bg-gray-50 transition-colors"
                  >
                    {selectedArtworkIds.has(artwork.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
              <div
                className={isSelectionMode && selectedArtworkIds.has(artwork.id) ? "ring-2 ring-blue-500 rounded-lg" : ""}
                onClick={(e) => {
                  if (isSelectionMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSelection?.(artwork.id);
                  }
                }}
                style={isSelectionMode ? { cursor: 'pointer' } : {}}
              >
                <ArtworkCard
                  {...artwork}
                  onFavorite={onFavorite}
                  isMasonry={false}
                  disableNavigation={isSelectionMode}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - Show if we have page info and artworks */}
        {onPageChange && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 pb-8">
            {safeTotalPages > 1 ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={safeCurrentPage === 1}
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                    className="flex items-center gap-2 px-6 py-2 border-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, index) => (
                      <div key={index}>
                        {pageNum === "..." ? (
                          <span className="px-2 text-gray-400">...</span>
                        ) : (
                          <Button
                            variant={safeCurrentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(pageNum as number)}
                            className={`min-w-[40px] ${
                              safeCurrentPage === pageNum
                                ? "bg-black text-white hover:bg-gray-800"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={safeCurrentPage >= safeTotalPages}
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                    className="flex items-center gap-2 px-6 py-2 border-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing page {safeCurrentPage} of {safeTotalPages} ({artworks.length} artworks)
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Showing all {artworks.length} artworks
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
