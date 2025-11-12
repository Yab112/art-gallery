import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Search, Filter, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ArtistCard } from "@/components/artist/artist-circle-card";
import { artists } from "@/components/artist/artists-data";

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredArtists = artists.filter((artist) => {
    return (
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCountry === "" || artist.country === selectedCountry) &&
      (selectedTag === "" || (artist.tags && artist.tags.includes(selectedTag)))
    );
  });

  const topSellingArtists = artists
    .filter((artist) => artist.isTopSelling)
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 10);

  const mostViewedArtists = artists
    .filter((artist) => artist.isMostViewed)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Artists</h1>
                  <p className="text-gray-500 mt-1">
                    {filteredArtists.length}{" "}
                    {filteredArtists.length === 1 ? "artist" : "artists"} found
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search Artists
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Art Style Tags */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Art Style
                </label>
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
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? "" : tag)
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Any Price</option>
                  <option value="0-1000">$0 - $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000+">$10,000+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Top Selling Artists */}
        {topSellingArtists.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-700" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Top Selling Artists
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topSellingArtists.map((artist) => (
                <Link
                  key={`top-${artist.id}`}
                  to={`/artist/${artist.id}`}
                  className="block"
                >
                  <ArtistCard artist={artist} showSales={true} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Artists */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              All Artists ({filteredArtists.length})
            </h2>
          </div>

          {filteredArtists.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Artists Found"
              description="Try adjusting your filters to see more artists."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredArtists.map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.id}`}
                  className="block"
                >
                  <ArtistCard artist={artist} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed Artists */}
        {mostViewedArtists.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-red-700" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Most Viewed Artists
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mostViewedArtists.map((artist) => (
                <Link
                  key={`viewed-${artist.id}`}
                  to={`/artist/${artist.id}`}
                  className="block"
                >
                  <ArtistCard artist={artist} showViews={true} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
