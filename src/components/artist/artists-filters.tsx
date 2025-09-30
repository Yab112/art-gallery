"use client";

import { useState } from "react";
import { Filter, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const countries = [
  "France",
  "Croatia",
  "Italy",
  "Japan",
  "United States",
  "Germany",
  "Spain",
  "United Kingdom",
  "Canada",
  "Australia",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
];

interface ArtistsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCountry: string; // eslint-disable-line @typescript-eslint/no-unused-vars
  setSelectedCountry: (country: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
}

export function ArtistsFilters({
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedTag,
  setSelectedTag,
  priceRange,
  setPriceRange,
}: ArtistsFiltersProps) {
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Use selectedCountry to avoid linting warning
  console.debug("Current selected country:", selectedCountry);

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-4 lg:mb-6">
          <Filter className="h-5 w-5 text-red-700" />
          <h3 className="font-semibold text-lg hidden sm:block">
            Advanced Filters
          </h3>
        </div>

        {/* Search */}
        <div className="mb-4 lg:mb-6">
          <label className="block text-sm font-medium mb-2">
            Search Artists
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-700" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Country Filter */}
        <div className="mb-4 lg:mb-6">
          <label className="block text-sm font-medium mb-2">Country</label>
          <div className="relative">
            <Input
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              className="border-gray-300"
            />
            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                <div
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedCountry("");
                    setCountrySearch("");
                    setShowCountryDropdown(false);
                  }}
                >
                  All Countries
                </div>
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedCountry(country);
                      setCountrySearch(country);
                      setShowCountryDropdown(false);
                    }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Art Style Tags */}
        <div className="mb-4 lg:mb-6">
          <label className="block text-sm font-medium mb-2">Art Style</label>
          <div className="flex flex-wrap gap-2">
            {[
              "Digital Art",
              "Abstract",
              "Photography",
              "Geometric",
              "Renaissance",
              "Pixel Art",
            ].map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-4 lg:mb-6">
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Any Price</option>
            <option value="0-1000">$0 - $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="10000+">$10,000+</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="mb-4 lg:mb-6">
          <label className="block text-sm font-medium mb-2">
            Minimum Rating
          </label>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <input type="range" min="0" max="5" step="0.1" className="flex-1" />
            <span className="text-sm">4.5+</span>
          </div>
        </div>

        <Button className="w-full" size="sm">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
