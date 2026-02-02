import { CategoriesSection } from "@/components/how-it-works/categories-section"
import { CTASection } from "@/components/how-it-works/cta-section"
import { FeaturesSection } from "@/components/how-it-works/features-section"
import { HeroSection } from "@/components/how-it-works/hero-section"
import { StepsSection } from "@/components/how-it-works/steps-section"

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <StepsSection />
            <FeaturesSection />
            <CategoriesSection />
            <CTASection />
        </div>
    )
}
