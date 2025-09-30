"use client";

import { useState } from "react";
import { ArtistsHeader } from "./artists-header";
import { ArtistsFilters } from "./artists-filters";
import { TopSellingArtists } from "./top-selling-artists";
import { AllArtistsGrid } from "./all-artists-grid";
import { MostViewedArtists } from "./most-viewed-artists";
import { Pagination } from "./pagination";
import { artists } from "./artists-data";

export function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const filteredArtists = artists.filter((artist) => {
    return (
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCountry === "" || artist.country === selectedCountry) &&
      (selectedTag === "" || (artist.tags && artist.tags.includes(selectedTag)))
    );
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <ArtistsHeader />

      <div className="w-full px-2 md:px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sticky Sidebar Filters - Only scrolls when reaching footer */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
            <ArtistsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* Main content - All artist sections */}
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <TopSellingArtists artists={artists} />
            <AllArtistsGrid artists={filteredArtists} />

            <div className="flex justify-center py-6 lg:py-8 border-t border-gray-200 mb-8 lg:mb-12">
              <Pagination
                onLoadMore={() => console.log("Loading more artworks...")}
              />
            </div>

            <MostViewedArtists artists={artists} />
          </div>
        </div>
      </div>
    </div>
  );
}
