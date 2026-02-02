import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

const headerImages = ["/artwork-3.jpg", "/artwork-4.jpg", "/artwork-5.jpg"]

export function ArtistsHeader() {
    const [currentHeaderImage, setCurrentHeaderImage] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeaderImage((prev) => (prev + 1) % headerImages.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {/* Dynamic header with background image */}
            <div
                className="relative flex h-48 items-center justify-center bg-center bg-cover transition-all duration-1000 md:h-64"
                style={{
                    backgroundImage: `url('${headerImages[currentHeaderImage]}')`
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <h1 className="relative font-bold text-3xl text-white tracking-wide md:text-5xl">
                    Artists
                </h1>

                {/* Header navigation dots */}
                <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex transform space-x-2">
                    {headerImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentHeaderImage(index)}
                            className={`h-2 w-2 rounded-full transition-all ${
                                index === currentHeaderImage ? "bg-white" : "bg-white/50"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b bg-gray-50 px-4 py-4">
                <nav className="mx-auto flex max-w-7xl items-center space-x-2 text-sm">
                    <a href="/" className="font-medium text-red-700">
                        Home
                    </a>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Artists</span>
                </nav>
            </div>
        </>
    )
}
