"use client";

import { ArtworkCard } from "@/components/artwork-card";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { artworks } from "./mockdtas";

interface ArtworkGridProps {
  onImageClick: (src: string) => void;
}

export function ArtworkGrid({ onImageClick }: ArtworkGridProps) {
  const [displayedArtworks, setDisplayedArtworks] = useState(
    artworks.slice(0, 6)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreArtworks = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const currentLength = displayedArtworks.length;
      const nextArtworks = artworks.slice(currentLength, currentLength + 4);

      if (nextArtworks.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedArtworks((prev) => [...prev, ...nextArtworks]);
      }

      setLoading(false);
    }, 800);
  }, [displayedArtworks.length, loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreArtworks();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreArtworks]);

  return (
    <div>
      <SectionTitle
        title="Artworks"
        subtitle={`${artworks.length} Artworks by this artist`}
      />


      <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
        {displayedArtworks.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid">
            <ArtworkCard isMasonry {...artwork} onImageClick={onImageClick} />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've seen all artworks by this artist</p>
        </div>
      )}
    </div>
  );
}
