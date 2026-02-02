import { SectionTitle } from "@/components/section-title"
import { Button } from "@/components/ui/button"

interface SectionTitleHeroProps {
    title: string
    subtitle: string
    buttonText: string
    onButtonClick?: () => void
}

export function SectionTitleHero({
    title,
    subtitle,
    buttonText,
    onButtonClick
}: SectionTitleHeroProps) {
    return (
        <section className="px-4 pt-16 pb-4">
            <div className="mx-auto max-w-7xl text-center">
                <SectionTitle title={title} subtitle={subtitle} className="mb-8" />
                <div className="mb-12 flex justify-center">
                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full bg-red-700 px-8 py-3 text-white hover:bg-red-800"
                        onClick={onButtonClick}
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </section>
    )
}
