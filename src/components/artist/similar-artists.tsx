"use client";

import { ArtistCard } from "@/components/artist-card";
import { SectionTitle } from "@/components/section-title";

const similarArtists = [
  {
    name: "Beatriz Milhazes",
    nationality: "Brazilian",
    image: "/artist-profile.jpg",
  },
  {
    name: "Kehinde Wiley",
    nationality: "American",
    image: "/artist-profile.jpg",
  },
  {
    name: "Yinka Shonibare",
    nationality: "British-Nigerian",
    image: "/artist-profile.jpg",
  },
  {
    name: "Kara Walker",
    nationality: "American",
    image: "/artist-profile.jpg",
  },
  {
    name: "El Anatsui",
    nationality: "Ghanaian",
    image: "/artist-profile.jpg",
  },
  {
    name: "Julie Mehretu",
    nationality: "Ethiopian-American",
    image: "/artist-profile.jpg",
  },
];

export function SimilarArtists() {
  return (
    <section className="mt-16 pt-8 border-t border-border">
      <SectionTitle
        title="Similar Artists"
        subtitle="You may also like"
        className="mb-8"
      />
      <div className="relative">
        <div
          id="similar-artists-container"
          className="scrollbar-hide flex gap-6 overflow-x-auto px-12"
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
