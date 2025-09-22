"use client";

import { useState } from "react";
import { CallToAction } from "@/components/call-to-action";
import { SectionTitleHero } from "@/components/ArtMarketplace/hero-section";
import { CategoryGrid } from "@/components/ArtMarketplace/category-grid";
import { SearchFilters } from "@/components/ArtMarketplace/search-filters";
import { ArtworkGrid } from "@/components/ArtMarketplace/artwork-grid";

const categories = [
  {
    id: "contemporary",
    name: "Contemporary Art",
    image: "/artwork-1.jpg",
    count: "1,234",
  },
  {
    id: "painting",
    name: "Painting",
    image: "/artwork-1.jpg",
    count: "2,567",
  },
  {
    id: "street",
    name: "Street Art",
    image: "/artwork-2.jpg",
    count: "892",
  },
  {
    id: "photography",
    name: "Photography",
    image: "/artwork-3.jpg",
    count: "1,456",
  },
  {
    id: "emerging",
    name: "Emerging Art",
    image: "/artwork-4.jpg",
    count: "678",
  },
  {
    id: "20th-century",
    name: "20th-Century Art",
    image: "/artwork-5.jpg",
    count: "3,234",
  },
];

const artworks = [
  {
    id: "1",
    image: "/artwork-1.jpg",
    title: "Abraham Casting Out Hagar and Ishmael",
    artist: "Rembrandt van Rijn",
    price: "US$68,500",
    year: "1637",
    medium: "Oil on canvas",
    dimensions: "24 × 30 in",
    seller: "M.S. Rau",
  },
  {
    id: "2",
    image: "/artwork-2.jpg",
    title: "Unique Painting",
    artist: "Salvador Dalí",
    price: "US$98,500",
    year: "1965",
    medium: "Oil on canvas",
    dimensions: "36 × 28 in",
    seller: "APC Gallery",
  },
  {
    id: "3",
    image: "/artwork-3.jpg",
    title: "Illumination Shadows",
    artist: "RETNA",
    price: "US$14,250",
    year: "2020",
    medium: "Mixed media",
    dimensions: "48 × 36 in",
    seller: "APC Gallery",
  },
  {
    id: "4",
    image: "/artwork-4.jpg",
    title: "Aida (Study)",
    artist: "RETNA",
    price: "US$18,500",
    year: "2016",
    medium: "Charcoal on paper",
    dimensions: "12 × 16 in",
    seller: "APC Gallery",
  },
  {
    id: "5",
    image: "/artwork-5.jpg",
    title: "Untitled Blue Series",
    artist: "Contemporary Artist",
    price: "US$25,000",
    year: "2023",
    medium: "Acrylic on canvas",
    dimensions: "40 × 30 in",
    seller: "Modern Gallery",
  },
  {
    id: "6",
    image: "/artwork-6.jpg",
    title: "Linear Study #3",
    artist: "Emerging Artist",
    price: "US$8,500",
    year: "2024",
    medium: "Ink on paper",
    dimensions: "18 × 24 in",
    seller: "New Wave Gallery",
  },
];

export default function ArtMarketplace() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFavorite = (id: string) => {
    console.log("[v0] Added to favorites:", id);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log("[v0] Selected category:", categoryId);
  };

  const handleLoadMore = () => {
    console.log("[v0] Loading more artworks...");
  };

  return (
    <div className="min-h-screen bg-white">
      <SectionTitleHero
        title="Collect art and design online"
        subtitle="Discover exceptional artworks from galleries, artists, and collectors worldwide"
        buttonText="Browse by collection"
      />

      <CategoryGrid
        categories={categories}
        onCategorySelect={handleCategorySelect}
      />

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        artworkCount={2296363}
      />

      <ArtworkGrid
        artworks={artworks}
        viewMode={viewMode}
        onFavorite={handleFavorite}
        onLoadMore={handleLoadMore}
      />

      <CallToAction
        title="Start Your Collection Today"
        subtitle="Join thousands of collectors discovering exceptional art"
        primaryButtonText="Discover Artists"
        secondaryButtonText="Browse Collections"
      />
    </div>
  );
}
