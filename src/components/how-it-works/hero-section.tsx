import { usePlatformSettings } from "@/queries/settingsQueries"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

export function HeroSection() {
    const { data: platformSettings } = usePlatformSettings()
    const siteName = platformSettings?.settings?.siteName

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="mb-6 font-bold text-3xl text-gray-900 lg:text-6xl">
                        How <span className="text-red-700">{siteName}</span> Works
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-base text-gray-500 leading-relaxed lg:text-lg">
                        Your trusted marketplace for discovering, buying, and selling modern and
                        contemporary art. Whether you're a collector, artist, or gallery, we make
                        art accessible to everyone.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link to="/buyart">
                            <Button
                                size="lg"
                                className="w-full bg-red-700 text-white hover:bg-red-800 sm:w-auto"
                            >
                                Start Collecting
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/sellart">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:w-auto"
                            >
                                Sell Your Art
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
