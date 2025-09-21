import { SectionTitle } from "@/components/section-title";
import { ArtworkCard } from "../artwork-card";

const newArtworks = [
  {
    id: "1",
    image: "/artwork-1.jpg",
    artist: "PYB",
    title: "LA Dance",
    year: "2025",
    price: "€260.00",
    medium: "Sculpture",
    dimensions: "20 x 30 x 6 cm",
    seller: "TAAR galerie",
    isPro: true,
    height: "short" as const,
  },
  {
    id: "2",
    image: "/artwork-2.jpg",
    artist: "CHROMA (FRÉDÉRIC FONT)",
    title: "Respiration intérieure",
    year: "2025",
    price: "€2,000.00",
    medium: "Painting",
    dimensions: "60 x 60 x 4 cm",
    seller: "Frédéric Font (Chroma)",
    height: "tall" as const,
  },
  {
    id: "3",
    image: "/artwork-3.jpg",
    artist: "HELENA MONNIELLO",
    title: "Rebirth",
    year: "2025",
    price: "€1,200.00",
    medium: "Painting",
    dimensions: "80 x 80 x 2 cm",
    seller: "Helena Monniello",
    height: "medium" as const,
  },
  {
    id: "4",
    image: "/artwork-4.jpg",
    artist: "YANNICK BOUILLAULT",
    title: "Organic Silmolde",
    year: "2023",
    price: "€1,200.00",
    medium: "Sculpture",
    dimensions: "68 x 9 x 25 cm",
    seller: "Yannick Bouillault",
    height: "tall" as const,
  },
  {
    id: "5",
    image: "/artwork-5.jpg",
    artist: "NOBLESS",
    title: "Snow Clue",
    year: "2024",
    price: "€1,900.00",
    medium: "Painting",
    dimensions: "73 x 46 x 1.5 cm",
    seller: "Academy of arts",
    height: "medium" as const,
  },
  {
    id: "6",
    image: "/artwork-6.jpg",
    artist: "OXYPOINT",
    title: "Turquoise Flow",
    year: "2025",
    price: "€410.00",
    medium: "Painting",
    dimensions: "40 x 30 x 2 cm",
    seller: "Oxypoint",
    height: "medium" as const,
  },
  {
    id: "7",
    image: "/artwork-1.jpg",
    artist: "DIDIER FOURNIER",
    title: "Famille (n° 376)",
    year: "2025",
    price: "€2,200.00",
    medium: "Sculpture",
    dimensions: "25 x 15 x 8 cm",
    seller: "Didier Fournier",
    height: "short" as const,
  },
  {
    id: "8",
    image: "/artwork-2.jpg",
    artist: "MARINE ARTIST",
    title: "Ocean Dreams",
    year: "2024",
    price: "€850.00",
    medium: "Painting",
    dimensions: "50 x 40 x 2 cm",
    seller: "Marine Gallery",
    height: "medium" as const,
  },
];

export function RelatedArtworks() {
  return (
    <section className=" px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title="Other works by Niina Villanueva"
          //   subtitle="The latest arrivals"
        />

        {/* Masonry Grid Layout */}
        <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
          {newArtworks.map((artwork) => (
            <div key={artwork.id} className="break-inside-avoid">
              <ArtworkCard isMasonry {...artwork} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
