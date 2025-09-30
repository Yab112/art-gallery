"use client";

import { ArtistCard } from "@/components/artist-card";
import { SectionTitle } from "@/components/section-title";

const similarArtists = [
  {
    name: "Beatriz Milhazes",
    nationality: "Brazilian",
    image: "/artwork-1.jpg",
  },
  {
    name: "Kehinde Wiley",
    nationality: "American",
    image: "/artwork-2.jpg",
  },
  {
    name: "Yinka Shonibare",
    nationality: "British-Nigerian",
    image: "/artwork-3.jpg",
  },
  {
    name: "Kara Walker",
    nationality: "American",
    image: "/artwork-4.jpg",
  },
  {
    name: "El Anatsui",
    nationality: "Ghanaian",
    image: "/artwork-5.jpg",
  },
  {
    name: "Julie Mehretu",
    nationality: "Ethiopian-American",
    image: "/artwork-6.jpg",
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
          className="scrollbar-hide flex gap-4 overflow-x-auto px-2"
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
