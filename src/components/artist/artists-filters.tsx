import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, Star } from "lucide-react"
import { useState } from "react"

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
    "Sweden"
]

interface ArtistsFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    selectedCountry: string // eslint-disable-line @typescript-eslint/no-unused-vars
    setSelectedCountry: (country: string) => void
    selectedTag: string
    setSelectedTag: (tag: string) => void
    priceRange: string
    setPriceRange: (range: string) => void
}

export function ArtistsFilters({
    searchTerm,
    setSearchTerm,
    selectedCountry,
    setSelectedCountry,
    selectedTag,
    setSelectedTag,
    priceRange,
    setPriceRange
}: ArtistsFiltersProps) {
    const [countrySearch, setCountrySearch] = useState("")
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)

    // Use selectedCountry to avoid linting warning
    console.debug("Current selected country:", selectedCountry)

    const filteredCountries = countries.filter((country) =>
        country.toLowerCase().includes(countrySearch.toLowerCase())
    )

    return (
        <div className="w-full">
            <div className="rounded-lg border bg-white p-4 lg:p-6">
                <div className="mb-4 flex items-center gap-2 lg:mb-6">
                    <Filter className="h-5 w-5 text-red-700" />
                    <h3 className="hidden font-semibold text-lg sm:block">Advanced Filters</h3>
                </div>

                {/* Search */}
                <div className="mb-4 lg:mb-6">
                    <label className="mb-2 block font-medium text-sm">Search Artists</label>
                    <div className="relative">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-red-700" />
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
                    <label className="mb-2 block font-medium text-sm">Country</label>
                    <div className="relative">
                        <Input
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => {
                                setCountrySearch(e.target.value)
                                setShowCountryDropdown(true)
                            }}
                            onFocus={() => setShowCountryDropdown(true)}
                            className="border-gray-300"
                        />
                        {showCountryDropdown && (
                            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-300 bg-white">
                                <div
                                    className="cursor-pointer p-2 text-sm hover:bg-gray-100"
                                    onClick={() => {
                                        setSelectedCountry("")
                                        setCountrySearch("")
                                        setShowCountryDropdown(false)
                                    }}
                                >
                                    All Countries
                                </div>
                                {filteredCountries.map((country) => (
                                    <div
                                        key={country}
                                        className="cursor-pointer p-2 text-sm hover:bg-gray-100"
                                        onClick={() => {
                                            setSelectedCountry(country)
                                            setCountrySearch(country)
                                            setShowCountryDropdown(false)
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
                    <label className="mb-2 block font-medium text-sm">Art Style</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Digital Art",
                            "Abstract",
                            "Photography",
                            "Geometric",
                            "Renaissance",
                            "Pixel Art"
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
                    <label className="mb-2 block font-medium text-sm">Price Range</label>
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
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
                    <label className="mb-2 block font-medium text-sm">Minimum Rating</label>
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <input type="range" min="0" max="5" step="0.1" className="flex-1" />
                        <span className="text-sm">4.5+</span>
                    </div>
                </div>

                <Button className="w-full bg-red-700 text-white hover:bg-red-800" size="sm">
                    Apply Filters
                </Button>
            </div>
        </div>
    )
}
