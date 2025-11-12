import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkAboutProps {
  artwork: Artwork;
  isOwner?: boolean;
}

export const ArtworkAbout = ({ artwork, isOwner = false }: ArtworkAboutProps) => {
  const navigate = useNavigate();
  const dimensions = artwork.dimensions as { width: number; height: number; depth?: number } | null;
  const dimensionsStr = dimensions
    ? `${dimensions.width} × ${dimensions.height}${dimensions.depth ? ` × ${dimensions.depth}` : ""} in`
    : "N/A";

  const handleSeeProfile = () => {
    if (artwork.user?.id) {
      navigate(`/artist/${artwork.user.id}`);
    }
  };

  const artistInitials = artwork.artist
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <div className="my-12 max-w-4xl">
      <h3 className="mb-6 border-b pb-2 text-xl">About the work</h3>
      <div className="grid gap-x-4 gap-y-2 text-sm md:grid-cols-2">
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Materials</span>
          <span className="cursor-pointer underline">{artwork.technique}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Size</span>
          <span>{dimensionsStr}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Support</span>
          <span className="cursor-pointer underline">{artwork.support}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">State</span>
          <span className="cursor-pointer underline">{artwork.state}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Year</span>
          <span>{artwork.yearOfArtwork}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Origin</span>
          <span className="cursor-pointer underline">{artwork.origin}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Frame</span>
          <span>{artwork.isFramed ? "Included" : "Not included"}</span>
        </div>
        <div className="flex justify-between border-gray-100 border-b py-2">
          <span className="text-muted-foreground">Weight</span>
          <span>{artwork.weight}</span>
        </div>
      </div>
      {artwork.description && (
        <div className="mt-6">
          <h4 className="mb-2 font-semibold">Description</h4>
          <p className="text-muted-foreground text-sm">{artwork.description}</p>
        </div>
      )}
      {/* Artist Information */}
      {artwork.user && (
        <div className="mt-8 flex items-center justify-between rounded-lg bg-muted/30 ">
          <div className="flex items-center gap-3">
            {artwork.user.image ? (
              <img
                src={artwork.user.image}
                alt={artwork.user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-bold text-white">
                {artistInitials}
              </div>
            )}
            <div>
              <h4 className="font-bold">{artwork.user.name}</h4>
              <p className="text-muted-foreground text-sm">{artwork.user.email}</p>
            </div>
          </div>
          {!isOwner && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
              onClick={handleSeeProfile}
            >
              See Profile
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
