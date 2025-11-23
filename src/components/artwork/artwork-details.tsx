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
    <div className="space-y-2">
      {/* Artist and Title */}
      <div>
        <h1 className="mb-0.5 text-xl font-semibold text-gray-900">{artwork.artist}</h1>
        <h2 className="mb-2 text-gray-600 text-base italic">
          {artwork.title || "Untitled"}, {artwork.yearOfArtwork}
        </h2>
        <div className="space-y-0.5 text-gray-500 text-xs">
          <p>{artwork.technique}</p>
          <p>{dimensionsStr}</p>
          {artwork.isFramed && <p>Frame included</p>}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-gray-500 text-xs">
          <Shield className="h-3 w-3" />
          <span>Unique work</span>
        </div>
      </div>
      {/* Curators' Pick - Only show if artwork is approved */}
      {artwork.status === "APPROVED" && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Verified size={14} className="text-gray-600" />
            <span className="font-medium text-xs text-gray-700">Curators' Pick</span>
          </div>
          <p className="text-gray-500 text-xs">
            Hand selected by Artsy curators this week
          </p>
        </div>
      )}
    </div>
  );
};
