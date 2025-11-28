import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, ChevronLeft, ChevronRight, CheckSquare, Square, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCheckFavorite } from "@/queries/favoriteQueries";

// List view favorite button component
function ListFavoriteButton({ artworkId, onFavorite }: { artworkId: string; onFavorite: (id: string) => void }) {
  const { data: favoriteCheck } = useCheckFavorite(artworkId);
  const isFavorited = favoriteCheck?.isFavorite || false;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onFavorite(artworkId);
      }}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
        isFavorited ? "text-red-500" : "text-gray-400"
      }`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
    </button>
  );
}

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
  status?: string;
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
  const navigate = useNavigate();
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
        {viewMode === "list" ? (
          <div className="space-y-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`group relative flex gap-6 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md ${
                  isSelectionMode && selectedArtworkIds.has(artwork.id)
                    ? "ring-2 ring-blue-500"
                    : ""
                } ${!isSelectionMode ? "cursor-pointer" : ""}`}
                onClick={(e) => {
                  if (isSelectionMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSelection?.(artwork.id);
                  } else {
                    navigate(`/artwork/${artwork.id}`);
                  }
                }}
              >
                {isSelectionMode && (
                  <div className="absolute top-4 left-4 z-20">
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
                
                {/* Image */}
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {artwork.image ? (
                    <img
                      src={artwork.image}
                      alt={`${artwork.title} by ${artwork.artist}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <Palette className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black text-sm uppercase tracking-wide truncate">
                        {artwork.artist}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        <span className="text-orange-500">🏆</span> {artwork.title}
                        {artwork.year && ` (${artwork.year})`}
                      </p>
                      <p className="font-bold text-lg mt-2">{artwork.price}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span>{artwork.medium}</span>
                        <span>{artwork.dimensions}</span>
                        <span>Seller: {artwork.seller}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ListFavoriteButton artworkId={artwork.id} onFavorite={onFavorite} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        )}

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
