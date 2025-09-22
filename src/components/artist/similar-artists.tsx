import { ArtistCard } from "@/components/artist-card";
import { SectionTitle } from "@/components/section-title";

const similarArtists = [
  {
    name: "Beatriz Milhazes",
    nationality: "Brazilian",
    image: "/artist-1.webp",
  },
  {
    name: "Kehinde Wiley",
    nationality: "American",
    image: "/artist-1.webp",
  },
  {
    name: "Yinka Shonibare",
    nationality: "British-Nigerian",
    image: "/artist-1.webp",
  },
  {
    name: "Kara Walker",
    nationality: "American",
    image: "/artist-1.webp",
  },
  {
    name: "El Anatsui",
    nationality: "Ghanaian",
    image: "/artist-1.webp",
  },
  {
    name: "Julie Mehretu",
    nationality: "Ethiopian-American",
    image: "/artist-1.webp",
  },
];

export function SimilarArtists() {
  return (
    <section className="mt-16 border-border border-t pt-8">
      <SectionTitle
        title="Similar Artists"
        subtitle="You may also like"
        className="mb-8"
      />
      <div className="relative">
        <div
          id="similar-artists-container"
          className="scrollbar-hide flex gap-6 overflow-x-auto "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {similarArtists.map((artist, index) => (
            <ArtistCard
              key={index}
              name={artist.name}
              nationality={artist.nationality}
              image={artist.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
