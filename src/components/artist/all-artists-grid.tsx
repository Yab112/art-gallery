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

interface AllArtistsGridProps {
    artists: Artist[]
}

export function AllArtistsGrid({ artists }: AllArtistsGridProps) {
    return (
        <div className="mb-8 lg:mb-12">
            <h2 className="mb-4 font-bold text-lg md:text-xl lg:mb-6 lg:text-2xl">
                All Artists ({artists.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 px-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
                {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
            </div>
        </div>
    )
}
