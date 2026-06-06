import { CollectionCtaSection } from "@/components/landing/collection-cta-section"
import { FeaturedArtworks } from "@/components/landing/featured-artwork"
import { HeroCarousel } from "@/components/landing/hero"
import { NewArrivals } from "@/components/landing/new-arrival"
import { TrendingArtists } from "@/components/landing/trending-artists"
import { TrendingArtworks } from "@/components/landing/trending-artworks"

const LandingPage = () => {
    return (
        <div>
            <HeroCarousel />
            <FeaturedArtworks />
            <TrendingArtworks />
            <NewArrivals />
            <CollectionCtaSection />
            <TrendingArtists />
        </div>
    )
}

export default LandingPage
