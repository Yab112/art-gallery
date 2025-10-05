import { ArtistCard } from "./artist-circle-card";

interface Artist {
  id: string;
  name: string;
  country: string;
  followers: number;
  artworks: number;
  avatar: string;
  tags?: string[];
  sales?: number;
  views?: number;
  rating?: number;
  isTopSelling?: boolean;
  isMostViewed?: boolean;
}

interface AllArtistsGridProps {
  artists: Artist[];
}

export function AllArtistsGrid({ artists }: AllArtistsGridProps) {
  return (
    <div className="mb-8 lg:mb-12">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 lg:mb-6">
        All Artists ({artists.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-4 px-2">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
