import { SectionTitle } from "@/components/section-title";
import { ArtistCard } from "@/components/artist/artist-circle-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetArtistsByTalentType } from "@/services/artist/useGetArtistsByTalentType";
import { useUser } from "@/queries/userQueries";

interface SimilarArtistsProps {
  artistId: string;
}

export function SimilarArtists({ artistId }: SimilarArtistsProps) {
  // Get the current artist's data to find their talent types
  const { data: userResponse } = useUser(artistId);
  const user = userResponse?.profile;
  
  // Get the first talent type ID to fetch similar artists
  // Handle both nested format (legacy) and flat format (new)
  const primaryTalentType = user?.talentTypes?.[0];
  const primaryTalentTypeId = primaryTalentType?.talentType?.id || primaryTalentType?.id;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 SimilarArtists - User talent types:', {
      artistId,
      talentTypes: user?.talentTypes,
      primaryTalentType,
      primaryTalentTypeId,
    });
  }
  
  // Fetch artists with similar talent type (excluding current artist)
  const { data, isLoading, error } = useGetArtistsByTalentType(
    primaryTalentTypeId || "",
    1,
    10
  );

  // Filter out the current artist and limit to 6
  const similarArtists = data?.artists
    ?.filter((artist) => artist.id !== artistId)
    .slice(0, 6) || [];

  if (!primaryTalentTypeId) {
    return null; // Don't show if artist has no talent types
  }

  if (isLoading) {
    return (
      <section className="mt-16 border-border border-t pt-8">
        <SectionTitle
          title="Similar Artists"
          subtitle="Artists with similar talent types"
          className="mb-8"
        />
        <div className="relative">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[180px] flex-shrink-0">
                <div className="flex flex-col items-center space-y-3 p-4">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('❌ Error fetching similar artists:', error);
    return null;
  }

  if (!similarArtists || similarArtists.length === 0) {
    // Debug: Show why no similar artists found
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ No similar artists found:', {
        primaryTalentTypeId,
        hasData: !!data,
        artistsCount: data?.artists?.length || 0,
        filteredCount: similarArtists.length,
      });
    }
    return null;
  }

  return (
    <section className="mt-16 border-border border-t pt-8">
      <SectionTitle
        title="Similar Artists"
        subtitle="Artists with similar talent types"
        className="mb-8"
      />
      <div className="relative">
        <div
          className="scrollbar-hide flex gap-4 overflow-x-auto px-2 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {similarArtists.map((artist) => (
            <div key={artist.id} className="min-w-[180px] flex-shrink-0">
              <ArtistCard
                artist={{
                  id: artist.id,
                  name: artist.name,
                  email: artist.email,
                  country: artist.country || "Unknown",
                  followers: 0,
                  artworks: artist.artworks || 0,
                  avatar: artist.avatar,
                  sales: artist.sales,
                  views: artist.views,
                  talentTypes: artist.talentTypes,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
