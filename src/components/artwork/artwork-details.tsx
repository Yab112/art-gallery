import { Shield, Verified } from "lucide-react";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkDetailsProps {
  artwork: Artwork;
}

export const ArtworkDetails = ({ artwork }: ArtworkDetailsProps) => {
  const dimensions = artwork.dimensions as { width: number; height: number; depth?: number } | null;
  const dimensionsStr = dimensions
    ? `${dimensions.width} × ${dimensions.height}${dimensions.depth ? ` × ${dimensions.depth}` : ""} in`
    : "N/A";

  return (
    <div className="space-y-4">
      {/* Artist and Title */}
      <div>
        <h1 className="mb-1 text-2xl">{artwork.artist}</h1>
        <h2 className="mb-4 text-muted-foreground text-xl italic">
          {artwork.title || "Untitled"}, {artwork.yearOfArtwork}
        </h2>
        <div className="space-y-0 text-muted-foreground text-sm">
          <p>{artwork.technique}</p>
          <p>{dimensionsStr}</p>
          {artwork.isFramed && <p>Frame included</p>}
        </div>
        <div className="mt-2 flex items-center gap-2 text-muted-foreground underline">
          <Shield className="mr-1 h-3 w-3" />
          Unique work
        </div>
      </div>
      {/* Curators' Pick - Only show if artwork is approved */}
      {artwork.status === "APPROVED" && (
        <div className="rounded-lg bg-muted/50 text-muted-foreground ">
          <div className="mb-2 flex items-center gap-2">
            <Verified size={16} />
            <span className="font-medium text-sm">Curators' Pick</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Hand selected by Artsy curators this week
          </p>
        </div>
      )}
    </div>
  );
};
