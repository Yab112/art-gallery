import { useState } from "react"
import { AllArtistsGrid } from "./all-artists-grid"
import { artists } from "./artists-data"
import { ArtistsFilters } from "./artists-filters"
import { ArtistsHeader } from "./artists-header"
import { MostViewedArtists } from "./most-viewed-artists"
import { Pagination } from "./pagination"
import { TopSellingArtists } from "./top-selling-artists"

export function ArtistsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCountry, setSelectedCountry] = useState("")
    const [selectedTag, setSelectedTag] = useState("")
    const [priceRange, setPriceRange] = useState("")

    const filteredArtists = artists.filter((artist) => {
        return (
            artist.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCountry === "" || artist.country === selectedCountry) &&
            (selectedTag === "" || (artist.tags && artist.tags.includes(selectedTag)))
        )
    })

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <ArtistsHeader />

            <div className="w-full px-2 py-8 md:px-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                    {/* Sticky Sidebar Filters - Only scrolls when reaching footer */}
                    <div className="lg:sticky lg:top-6 lg:w-80 lg:flex-shrink-0 lg:self-start xl:w-96">
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
                    <div className="min-w-0 flex-1 overflow-x-hidden">
                        <TopSellingArtists artists={artists} />
                        <AllArtistsGrid artists={filteredArtists} />

                        <div className="mb-8 flex justify-center border-gray-200 border-t py-6 lg:mb-12 lg:py-8">
                            <Pagination
                                onLoadMore={() => console.log("Loading more artworks...")}
                            />
                        </div>

                        <MostViewedArtists artists={artists} />
                    </div>
                </div>
            </div>
        </div>
    )
}
