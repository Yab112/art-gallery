import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

const headerImages = ["/artwork-3.jpg", "/artwork-4.jpg", "/artwork-5.jpg"];

export function ArtistsHeader() {
  const [currentHeaderImage, setCurrentHeaderImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeaderImage((prev) => (prev + 1) % headerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Dynamic header with background image */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center flex items-center justify-center transition-all duration-1000"
        style={{
          backgroundImage: `url('${headerImages[currentHeaderImage]}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative text-3xl md:text-5xl font-bold text-white tracking-wide">
          Artists
        </h1>

        {/* Header navigation dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {headerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeaderImage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentHeaderImage ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-4 border-b">
        <nav className="flex items-center space-x-2 text-sm max-w-7xl mx-auto">
          <a href="/" className="text-red-700 font-medium">
            Home
          </a>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Artists</span>
        </nav>
      </div>
    </>
  );
}
