import { CTASection } from "@/components/landing/cta";
import { FeaturedArtworks } from "@/components/landing/featured-artwork";
import { HeroCarousel } from "@/components/landing/hero";
import { NewArrivals } from "@/components/landing/new-arrival";
import { PremiumService } from "@/components/landing/service";
import { TrendingArtists } from "@/components/landing/trending-artists";

const LandingPage = () => {
  return (
    <div>
      <HeroCarousel />
      <FeaturedArtworks />
      <PremiumService />
      <NewArrivals />
      <TrendingArtists />
      <CTASection />
    </div>
  );
};

export default LandingPage;
