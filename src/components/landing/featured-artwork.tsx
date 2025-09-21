import { ArtworkCard } from "@/components/artwork-card";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const artworks = [
  {
    id: "1",
    image: "/artwork-1.jpg",
    title: "City of Boxes - Auroraville",
    artist: "WERNER ROELANDT",
    price: "€1,300.00",
    year: "2024",
    medium: "Photography",
    dimensions: "60 x 90 x 0.2 cm",
    seller: "Werner Roelandt",
  },
  {
    id: "2",
    image: "/artwork-1.jpg",
    title: "Water lilies on Lake Bled",
    artist: "OXYPOINT",
    price: "€390.00",
    year: "2025",
    medium: "Painting",
    dimensions: "30 x 30 x 0.3 cm",
    seller: "OXYPOINT",
  },
  {
    id: "3",
    image: "/artwork-1.jpg",
    title: "Kaws is in LOVE",
    artist: "PATRICK CORNÉE",
    price: "€1,200.00",
    year: "2025",
    medium: "Painting",
    dimensions: "30 x 30 x 3 cm",
    seller: "Cornee Patrick",
  },
  {
    id: "4",
    image: "/artwork-1.jpg",
    title: "Le vieux pot de peinture",
    artist: "YANNICK BOUILLAULT",
    price: "€380.00",
    year: "2024",
    medium: "Sculpture",
    dimensions: "30 x 14 x 16 cm",
    seller: "Yannick Bouillault",
  },
  {
    id: "5",
    image: "/artwork-1.jpg",
    title: "Abstract Dreams",
    artist: "MARIE DUBOIS",
    price: "€750.00",
    year: "2024",
    medium: "Painting",
    dimensions: "40 x 50 x 2 cm",
    seller: "Marie Dubois",
  },
];

export function FeaturedArtworks() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, artworks.length - itemsPerPage) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev >= artworks.length - itemsPerPage ? 0 : prev + 1
    );
  };

  const handleFavorite = (id: string) => {
    console.log("[v0] Added to favorites:", id);
    // Add favorite logic here
  };

  const handleSearch = (id: string) => {
    console.log("[v0] Search artwork:", id);
    // Add search logic here
  };

  const visibleArtworks = artworks.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl ">
        <div className="relative mb-12">
          <SectionTitle
            title="FEATURED ARTWORKS"
            subtitle="Artalistic Selection"
            className="mb-8"
          />

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 left-0 rounded-full bg-transparent"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-0 rounded-full bg-transparent"
            onClick={handleNext}
            disabled={currentIndex >= artworks.length - itemsPerPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {visibleArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              {...artwork}
              onFavorite={handleFavorite}
              onSearch={handleSearch}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
