import { Eye } from "lucide-react"
import { ArtistCard } from "./artist-circle-card"

interface Artist {
    id: string
    name: string
    country: string
    followers: number
    artworks: number
    avatar: string
    tags?: string[]
    sales?: number
    views?: number
    rating?: number
    isTopSelling?: boolean
    isMostViewed?: boolean
}

interface MostViewedArtistsProps {
    artists: Artist[]
}

export function MostViewedArtists({ artists }: MostViewedArtistsProps) {
    const mostViewedArtists = artists
        .filter((artist) => artist.isMostViewed)
        .sort((a, b) => (b.views || 0) - (a.views || 0))

    return (
        <div className="mb-8 lg:mb-12">
            <div className="mb-4 flex items-center gap-2 lg:mb-6">
                <Eye className="h-5 w-5 text-red-700" />
                <h2 className="font-bold text-lg md:text-xl lg:text-2xl">
                    Your Most Viewed Artists
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 px-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
                {mostViewedArtists.map((artist) => (
                    <ArtistCard key={`viewed-${artist.id}`} artist={artist} showViews={true} />
                ))}
            </div>
        </div>
    )
}
