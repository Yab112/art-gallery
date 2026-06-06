import { MarketplaceCta } from "@/components/ArtMarketplace/marketplace-cta"
import { useArtworks } from "@/queries/artworkQueries"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

export function CollectionCtaSection() {
    const navigate = useNavigate()
    const { data: artworksData } = useArtworks({
        limit: 20,
        page: 1,
        isApproved: true,
        sortBy: "createdAt",
        orderBy: "desc",
    })

    const previewArtworks = useMemo(() => {
        const candidates = (artworksData?.artworks ?? [])
            .map((artwork) => {
                const image = artwork.photos?.[0]
                if (typeof image !== "string" || image.trim() === "") return null
                return {
                    id: artwork.id,
                    image,
                    title: artwork.title || "Untitled",
                }
            })
            .filter((item): item is { id: string; image: string; title: string } => item !== null)

        if (candidates.length <= 4) return candidates

        const shuffled = [...candidates]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, 4)
    }, [artworksData?.artworks])

    return (
        <MarketplaceCta
            fullWidth
            title="Start Your Collection Today"
            subtitle="Follow artists, save pieces you love, and build a collection that tells your story."
            primaryButtonText="Discover Artists"
            secondaryButtonText="Browse Collections"
            previewArtworks={previewArtworks}
            onPrimaryClick={() => navigate("/artists")}
            onSecondaryClick={() => navigate("/collections")}
        />
    )
}
