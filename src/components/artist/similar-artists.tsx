import { SectionTitle } from "@/components/section-title";
import { useGetSimilarArtists } from "@/services/artist/useGetSimilarArtists";
import { ArtistCard } from "@/components/artist/artist-circle-card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarArtistsProps {
  artistId: string;
}

export function SimilarArtists({ artistId }: SimilarArtistsProps) {
  const { data, isLoading, error } = useGetSimilarArtists(artistId, 6);

  if (isLoading) {
    return (
      <section className="mt-16 border-border border-t pt-8">
        <SectionTitle
          title="Similar Artists"
          subtitle="You may also like"
          className="mb-8"
        />
        <div className="relative">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[200px] bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
                <div className="flex flex-col items-center space-y-3">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data || !data.artists || data.artists.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-border border-t pt-8">
      <SectionTitle
        title="Similar Artists"
        subtitle="You may also like - Based on artwork count, sales, and views"
        className="mb-8"
      />
      <div className="relative">
        <div
          id="similar-artists-container"
          className="scrollbar-hide flex gap-4 overflow-x-auto px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.artists.map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.id}`}
              className="block min-w-[200px]"
            >
              <ArtistCard
                artist={{
                  id: artist.id,
                  name: artist.name,
                  country: "Unknown",
                  followers: 0,
                  artworks: artist.artworks,
                  avatar: artist.avatar,
                  sales: artist.sales,
                  views: artist.views,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
