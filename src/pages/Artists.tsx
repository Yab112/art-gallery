import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Search, TrendingUp, Eye, Loader2, Mail } from "lucide-react";
import { ArtistCard } from "@/components/artist/artist-circle-card";
import { useGetAllArtists } from "@/services/artist/useGetAllArtists";
import { useGetTopSellingArtists } from "@/services/artist/useGetTopSellingArtists";
import { useGetMostViewedArtists } from "@/services/artist/useGetMostViewedArtists";
import { ArtistsPageSkeleton } from "@/components/artist/artists-page-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetTalentTypes } from "@/services/talent-type/useGetTalentTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Comprehensive list of countries
const ALL_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Maldives",
  "Malta",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function ArtistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const talentTypeSlug = searchParams.get("talentType") || "";
  
  // Get page from URL params, default to 1
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 24; // Show 24 artists per page

  const [searchTerm, setSearchTerm] = useState("");
  // Debounce search term to avoid API calls on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTalentType, setSelectedTalentType] = useState("");
  const [emailSearch, setEmailSearch] = useState("");

  // Update URL search params
  const updateSearchParams = (
    updates: Record<string, string | number | null>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Reset to page 1 when filters change (but not on initial mount)
  const prevFiltersRef = useRef({ debouncedSearchTerm, selectedCountry, selectedTalentType, emailSearch });
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged = 
      prevFilters.debouncedSearchTerm !== debouncedSearchTerm ||
      prevFilters.selectedCountry !== selectedCountry ||
      prevFilters.selectedTalentType !== selectedTalentType ||
      prevFilters.emailSearch !== emailSearch;
    
    if (filtersChanged && page !== 1) {
      updateSearchParams({ page: 1 });
    }
    
    prevFiltersRef.current = { debouncedSearchTerm, selectedCountry, selectedTalentType, emailSearch };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCountry, selectedTalentType, emailSearch, page]);

  // Fetch talent types to filter by talent type slug
  const { data: talentTypes = [] } = useGetTalentTypes();

  // Fetch artists data from backend - use debounced search term and pagination
  const {
    data: allArtistsData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    error: allArtistsError,
  } = useGetAllArtists(page, limit, debouncedSearchTerm || undefined);
  const { data: topSellingData, isLoading: isLoadingTopSelling } =
    useGetTopSellingArtists(10);
  const { data: mostViewedData, isLoading: isLoadingMostViewed } =
    useGetMostViewedArtists(10);

  // Fix for Radix UI Select dropdown page shift issue
  // Aggressively prevents margin/padding from being added to body/html
  useEffect(() => {
    const styleId = "prevent-select-margin-artists";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = `
        body[data-scroll-locked],
        html[data-scroll-locked],
        body[data-radix-scroll-lock],
        html[data-radix-scroll-lock] {
          margin-right: 0 !important;
          margin-left: 0 !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        }
        body {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        html {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Use interval to continuously remove margin/padding (backup approach)
    const interval = setInterval(() => {
      const body = document.body;
      const html = document.documentElement;

      // Force remove margin-right and padding-right from body and html
      body.style.setProperty("margin-right", "0", "important");
      body.style.setProperty("padding-right", "0", "important");
      body.style.setProperty("margin-left", "0", "important");
      body.style.setProperty("padding-left", "0", "important");
      html.style.setProperty("margin-right", "0", "important");
      html.style.setProperty("padding-right", "0", "important");
      html.style.setProperty("margin-left", "0", "important");
      html.style.setProperty("padding-left", "0", "important");
    }, 16); // Check every frame (~60fps)

    return () => {
      clearInterval(interval);
      // Don't remove style element as it should persist
    };
  }, []);

  // Transform API data to match ArtistCard component format
  const transformArtist = (artist: any) => {
    const defaultAvatar = "/default-avatar.png";
    const avatar = artist.avatar || artist.image || defaultAvatar;

    // Map talent types - handle both formats
    let talentTypes = [];
    if (artist.talentTypes && Array.isArray(artist.talentTypes)) {
      talentTypes = artist.talentTypes.map((tt: any) => {
        // Handle nested format: { talentType: { id, name, slug } }
        if (tt.talentType) {
          return {
            id: tt.talentType.id,
            name: tt.talentType.name,
            slug: tt.talentType.slug,
          };
        }
        // Handle direct format: { id, name, slug }
        return {
          id: tt.id,
          name: tt.name,
          slug: tt.slug,
        };
      });
    }

    return {
      id: artist.id || artist.userId,
      name: artist.name,
      email: artist.email,
      country: artist.country || "Unknown",
      followers: 0, // Not available in current API
      artworks: artist.artworks || artist.artworkCount || 0,
      avatar: avatar.trim() === "" ? defaultAvatar : avatar,
      tags: [], // Not available in current API
      sales: artist.sales || artist.totalSales || 0,
      views: artist.views || artist.totalViews || 0,
      rating: undefined, // Not available in current API
      talentTypes: talentTypes,
    };
  };

  const allArtists = useMemo(() => {
    if (!allArtistsData?.artists) return [];
    return allArtistsData.artists.map(transformArtist);
  }, [allArtistsData]);

  const topSellingArtists = useMemo(() => {
    if (!topSellingData?.artists) return [];
    return topSellingData.artists.map(transformArtist);
  }, [topSellingData]);

  const mostViewedArtists = useMemo(() => {
    if (!mostViewedData?.artists) return [];
    return mostViewedData.artists.map(transformArtist);
  }, [mostViewedData]);

  // Filter artists based on selected filters
  // Note: Search is now handled by backend via debouncedSearchTerm
  // This local filter is for client-side filters (country, tags, talent type)
  const filteredArtists = useMemo(() => {
    let filtered = allArtists;

    // Filter by talent type if provided in query params
    if (talentTypeSlug && talentTypes.length > 0) {
      const talentType = talentTypes.find((tt) => tt.slug === talentTypeSlug);
      if (talentType && allArtistsData?.artists) {
        // Filter artists that have this talent type
        filtered = allArtistsData.artists
          .filter((artist: any) => {
            return artist.talentTypes?.some(
              (tt: any) => tt.talentType?.id === talentType.id
            );
          })
          .map(transformArtist);
      }
    }

    // Apply other filters
    return filtered.filter((artist) => {
      const countryMatch =
        selectedCountry === "" || artist.country === selectedCountry;

      // Filter by talent type
      const talentTypeMatch =
        selectedTalentType === "" ||
        (artist.talentTypes &&
          artist.talentTypes.length > 0 &&
          artist.talentTypes.some((tt: any) => {
            // Handle both formats: direct talentType object or nested talentType
            const ttId = tt.id || tt.talentType?.id;
            return ttId === selectedTalentType;
          }));

      // Filter by email search
      const emailMatch =
        emailSearch === "" ||
        (artist.email &&
          artist.email.toLowerCase().includes(emailSearch.toLowerCase()));

      return countryMatch && talentTypeMatch && emailMatch;
    });
  }, [
    allArtists,
    selectedCountry,
    selectedTalentType,
    emailSearch,
    talentTypeSlug,
    talentTypes,
    allArtistsData,
  ]);

  // Combine all countries: comprehensive list + countries from artist data
  const countries = useMemo(() => {
    const countrySet = new Set<string>();

    // Add all comprehensive countries
    ALL_COUNTRIES.forEach((country) => {
      countrySet.add(country);
    });

    // Also add countries from artist data (in case there are countries not in our list)
    allArtists.forEach((artist) => {
      if (
        artist.country &&
        artist.country.trim() !== "" &&
        artist.country !== "Unknown"
      ) {
        countrySet.add(artist.country);
      }
    });

    // Also extract from top selling artists
    topSellingArtists.forEach((artist) => {
      if (
        artist.country &&
        artist.country.trim() !== "" &&
        artist.country !== "Unknown"
      ) {
        countrySet.add(artist.country);
      }
    });

    // Also extract from most viewed artists
    mostViewedArtists.forEach((artist) => {
      if (
        artist.country &&
        artist.country.trim() !== "" &&
        artist.country !== "Unknown"
      ) {
        countrySet.add(artist.country);
      }
    });

    return Array.from(countrySet).sort();
  }, [allArtists, topSellingArtists, mostViewedArtists]);

  // Only show skeleton on initial load (when there's no data yet)
  // isFetching is true during background refetches, but we don't want to show skeleton then
  const isInitialLoading = isLoadingAll && !allArtistsData;
  const isLoadingOther = isLoadingTopSelling || isLoadingMostViewed;

  if (isInitialLoading || isLoadingOther) {
    return <ArtistsPageSkeleton />;
  }

  if (allArtistsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load artists</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Discover Artists
              </h1>
              <p className="text-red-100 text-lg">
                Explore talented creators from around the world
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {filteredArtists.length}{" "}
                    {filteredArtists.length === 1 ? "Artist" : "Artists"}
                  </span>
                </div>
                {isFetchingAll && (
                  <div className="flex items-center gap-2 text-red-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters Section - Always visible and sticky */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 p-6 sticky top-4 z-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search by Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search by Name
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

            {/* Search by Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search by Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Talent Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Talent Type
              </label>
              <Select
                value={selectedTalentType || "all"}
                onValueChange={(value) =>
                  setSelectedTalentType(value === "all" ? "" : value)
                }
                {...({ modal: false } as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Talent Types" />
                </SelectTrigger>
                <SelectContent
                  className="z-[200] max-h-[300px]"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="all">All Talent Types</SelectItem>
                  {talentTypes.map((talentType) => (
                    <SelectItem key={talentType.id} value={talentType.id}>
                      {talentType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <Select
                value={selectedCountry || "all"}
                onValueChange={(value) =>
                  setSelectedCountry(value === "all" ? "" : value)
                }
                {...({ modal: false } as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent
                  className="z-[200] max-h-[300px]"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.length > 0 &&
                    countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Top Selling Artists - Featured Section */}
        {topSellingArtists.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Top Selling Artists
                </h2>
                <p className="text-sm text-gray-500">
                  Most successful creators this month
                </p>
              </div>
            </div>
            {isLoadingTopSelling ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {topSellingArtists.map((artist) => (
                  <div key={`top-${artist.id}`}>
                    <ArtistCard artist={artist} showSales={true} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Artists - Main Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                All Artists
              </h2>
              <p className="text-sm text-gray-500">
                Browse through our complete collection of talented artists
              </p>
            </div>
          </div>

          {filteredArtists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <EmptyState
                icon={Users}
                title="No Artists Found"
                description="Try adjusting your filters to see more artists."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredArtists.map((artist) => (
                  <div key={artist.id}>
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {allArtistsData?.pagination && allArtistsData.pagination.total > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchParams({ page: page - 1 })}
                    disabled={page === 1 || allArtistsData.pagination.pages <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {allArtistsData.pagination.pages} (
                    {allArtistsData.pagination.total}{" "}
                    {allArtistsData.pagination.total === 1 ? "artist" : "artists"})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchParams({ page: page + 1 })}
                    disabled={page >= allArtistsData.pagination.pages || allArtistsData.pagination.pages <= 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Most Viewed Artists */}
        {mostViewedArtists.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Most Viewed Artists
                </h2>
                <p className="text-sm text-gray-500">
                  Popular creators getting attention
                </p>
              </div>
            </div>
            {isLoadingMostViewed ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mostViewedArtists.map((artist) => (
                  <div key={`viewed-${artist.id}`}>
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
