import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArtistCard } from "../artist-card";
import { SectionTitle } from "../section-title";

const artists = [
  {
    name: "Daniel Roibal",
    image: "/artwork-1.jpg",
  },
  {
    name: "Alex Katz",
    nationality: "American",
    birthYear: "1927",
    image: "/artwork-2.jpg",
  },
  {
    name: "Salvo",
    nationality: "Italian",
    birthYear: "1947",
    deathYear: "2015",
    image: "/artwork-3.jpg",
  },
  {
    name: "Andy Warhol",
    nationality: "American",
    birthYear: "1928",
    deathYear: "1987",
    image: "/artwork-4.jpg",
  },
  {
    name: "Katherine",
    image: "/artwork-5.jpg",
  },
];

export function TrendingArtists() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleFollow = (artistName: string) => {
    console.log(`Following ${artistName}`);
  };

  return (
    <section className=" px-4 py-16">
      <div className="mx-auto max-w-7xl ">
        <div className="relative mb-12">
          <SectionTitle
            title="TRENDING ARTISTS"
            subtitle="Discover popular creators"
            className="mb-8"
          />

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 left-0 rounded-full bg-transparent"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-0 rounded-full bg-transparent"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {artists.map((artist, index) => (
              <Link key={index} to={`/artist/${artist.name}`}>
                <ArtistCard
                  key={index}
                  name={artist.name}
                  nationality={artist.nationality}
                  birthYear={artist.birthYear}
                  deathYear={artist.deathYear}
                  image={artist.image}
                  onFollow={() => handleFollow(artist.name)}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
