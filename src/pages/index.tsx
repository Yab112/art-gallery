import { FeaturedArtworks } from "@/components/landing/featured-artwork";
import { HeroCarousel } from "@/components/landing/hero";
import { NewArrivals } from "@/components/landing/new-arrival";
import { TrendingArtists } from "@/components/landing/trending-artists";
import { TrendingArtworks } from "@/components/landing/trending-artworks";
import { TrustedByBusinesses } from "@/components/landing/trusted-by-businesses";

const LandingPage = () => {
  return (
    <div>
      <HeroCarousel />
      <FeaturedArtworks />
      <TrendingArtworks />
      <NewArrivals />
      <TrendingArtists />
      <TrustedByBusinesses />
    </div>
  );
};

export default LandingPage;
