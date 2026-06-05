import { Button } from "@/components/ui/button"
import { usePlatformSettings } from "@/queries/settingsQueries"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const slides = [
    {
        id: 1,
        artwork: "/hero-img-1.jpg",
        content: {
            subtitle: "Offer inspiration and creativity with our gift cards",
            title: "The perfect choice for any Art enthusiast.",
            button: "View artworks"
        }
    },
    {
        id: 2,
        artwork: "/hero-img-2.jpg",
        content: {
            subtitle: "Artist of the month",
            title: "Discover Chroma",
            button: "View artworks"
        }
    }
]

export function HeroCarousel() {
    const { data: platformSettings } = usePlatformSettings()
    const siteName = platformSettings?.settings?.siteName
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const currentSlideData = slides[currentSlide]
    const navigate = useNavigate()

    return (
        <div className="relative">
            <div className={" relative min-h-[60vh] overflow-hidden"}>
                {/* Full-width background image */}
                <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                    style={{
                        backgroundImage: `url(${currentSlideData.artwork})`,
                        backgroundBlendMode: "multiply"
                        // opacity: 0.3,
                    }}
                />

                <div className="relative z-10 mx-auto flex h-full min-h-[85vh] max-w-7xl items-center justify-end px-4 py-12">
                    {/* Content (if exists) */}
                    {currentSlideData.content && (
                        <div className="">
                            <p className="mb-2 max-w-xs font-semibold text-black text-lg">
                                {currentSlideData.content.subtitle}
                            </p>
                            <h1 className="mb-8 max-w-md font-bold text-3xl text-black">
                                {currentSlideData.content.title}
                            </h1>
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
                                onClick={() => navigate("/buyart")}
                            >
                                {currentSlideData.content.button}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Carousel Dots */}
                <div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-20 flex transform gap-2">
                    {slides.map((_, index) => (
                        <button
                            type="button"
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-3 w-3 rounded-full transition-colors ${
                                index === currentSlide ? "bg-black" : "bg-black/30"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Marketplace intro */}
            <section className="border-stone-200 border-t bg-stone-50">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
                    <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-5">
                            <p className="mb-3 font-semibold text-[11px] text-red-700 uppercase tracking-[0.22em]">
                                Buy &amp; sell online
                            </p>
                            <h2 className="font-poppins font-semibold text-[1.85rem] text-gray-900 leading-[1.12] tracking-tight sm:text-[2.65rem]">
                                {siteName ?? "Art Gallery"}
                                <span className="mt-2 block font-normal text-[0.58em] text-gray-500 tracking-normal sm:text-[0.52em]">
                                    the art marketplace
                                </span>
                            </h2>
                        </div>

                        <div className="lg:col-span-7 lg:border-stone-200 lg:border-l lg:pl-12">
                            <p className="max-w-2xl text-[15px] text-gray-600 leading-relaxed sm:text-base">
                                Collectors, artists, and professionals ,find modern and contemporary
                                work to buy, or bring your own pieces to a global audience.{" "}
                                {siteName ?? "Art Gallery"} guides you from first browse to final
                                sale.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {["Collectors", "Artists", "Professionals", "Amateurs"].map(
                                    (role) => (
                                        <span
                                            key={role}
                                            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-gray-600 text-xs tracking-wide"
                                        >
                                            {role}
                                        </span>
                                    )
                                )}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Button
                                    size="lg"
                                    className="rounded-full bg-red-700 px-7 text-white hover:bg-red-800"
                                    onClick={() => navigate("/buyart")}
                                >
                                    Browse artworks
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/sellart")}
                                    className="group font-medium text-gray-900 text-sm transition-colors hover:text-red-700"
                                >
                                    Sell your art
                                    <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                                        →
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
