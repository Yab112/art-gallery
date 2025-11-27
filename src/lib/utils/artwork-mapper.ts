import type { Artwork } from "@/types/artwork.types";

export interface ArtworkCardProps {
  id: string;
  image: string;
  title: string;
  artist: string;
  price: string;
  year?: string;
  medium: string;
  dimensions: string;
  seller: string;
  status?: string;
}

/**
 * Maps artwork data from the API to props expected by ArtworkCard component
 */
export function mapArtworkToCardProps(artwork: Artwork): ArtworkCardProps {
  // Get the first photo as the main image, or use a placeholder
  const image = artwork.photos && artwork.photos.length > 0 
    ? artwork.photos[0] 
    : "/placeholder.svg";

  // Format price with currency
  const price = artwork.desiredPrice 
    ? `$${artwork.desiredPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Price not available";

  // Format dimensions
  const dimensions = artwork.dimensions
    ? `${artwork.dimensions.height} × ${artwork.dimensions.width}${artwork.dimensions.depth ? ` × ${artwork.dimensions.depth}` : ''} cm`
    : "Dimensions not available";

  // Get artist name from user or artwork
  const artist = artwork.user?.name || artwork.artist || "Unknown Artist";

  // Get seller name
  const seller = artwork.user?.name || artwork.artist || "Unknown Seller";

  // Get medium/technique (support field)
  const medium = artwork.support || "Unknown Medium";

  return {
    id: artwork.id,
    image,
    title: artwork.title || "Untitled",
    artist,
    price,
    year: artwork.yearOfArtwork || undefined,
    medium,
    dimensions,
    seller,
    status: artwork.status,
  };
}

