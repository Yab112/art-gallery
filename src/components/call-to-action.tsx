import { SectionTitle } from "@/components/section-title"
import { Button } from "@/components/ui/button"

interface CallToActionProps {
    title: string
    subtitle: string
    primaryButtonText: string
    secondaryButtonText: string
    onPrimaryClick?: () => void
    onSecondaryClick?: () => void
}

export function CallToAction({
    title,
    subtitle,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryClick,
    onSecondaryClick
}: CallToActionProps) {
    return (
        <section className="bg-gray-50 px-4 py-16">
            <div className="mx-auto max-w-4xl text-center">
                <SectionTitle title={title} subtitle={subtitle} className="mb-8" />
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
                        onClick={onPrimaryClick}
                    >
                        {primaryButtonText}
                    </Button>
                    <Button
                        size="lg"
                        className="rounded-full bg-red-700 px-8 py-3 text-white hover:bg-red-800"
                        onClick={onSecondaryClick}
                    >
                        {secondaryButtonText}
                    </Button>
                </div>
            </div>
        </section>
    )
}
