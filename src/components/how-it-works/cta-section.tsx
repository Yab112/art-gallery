import { usePlatformSettings } from "@/queries/settingsQueries"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function CTASection() {
    const { data: platformSettings } = usePlatformSettings()
    const siteName = platformSettings?.settings?.siteName

    return (
        <div className="bg-red-700 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="mb-4 font-bold text-2xl text-white lg:text-4xl">
                    Ready to Start Your Art Journey?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-red-50/90 text-base lg:text-lg">
                    Join thousands of art lovers who trust {siteName} for their collecting needs
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link to="/buyart">
                        <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                            Browse Artworks
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/artists">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white bg-white text-red-700 hover:text-red-700"
                        >
                            Discover Artists
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
