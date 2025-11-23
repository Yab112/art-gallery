import type { Artwork } from "@/types/artwork.types";

/**
 * Maps backend artwork data to ArtworkCard component props
 */
export function mapArtworkToCardProps(artwork: Artwork) {
  // Get the first photo or use a placeholder
  const image = artwork.photos && artwork.photos.length > 0 
    ? artwork.photos[0] 
    : "/artwork-1.jpg";

  // Format price with currency - handle missing or invalid price
  const price = artwork.desiredPrice 
    ? `€${artwork.desiredPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "€0.00";

  // Format dimensions - handle missing dimensions
  let dimensions = "N/A";
  if (artwork.dimensions) {
    const { width, height, depth } = artwork.dimensions;
    if (width && height) {
      dimensions = depth
        ? `${width} x ${height} x ${depth} cm`
        : `${width} x ${height} cm`;
    }
  }

  // Get seller name from user or artist field
  const seller = artwork.user?.name || artwork.artist || "Unknown";

  return {
    id: artwork.id,
    image,
    title: artwork.title || "Untitled",
    artist: artwork.artist || "Unknown Artist",
    price,
    year: artwork.yearOfArtwork || "",
    medium: artwork.support || "Unknown",
    dimensions,
    seller,
  };
}

