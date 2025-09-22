import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    id: 1,
    artwork: "/hero-img-1.jpg",
    content: {
      subtitle: "Offer inspiration and creativity with our gift cards",
      title: "The perfect choice for any Art enthusiast.",
      button: "View artworks",
    },
  },
  {
    id: 2,
    artwork: "/hero-img-2.jpg",
    content: {
      subtitle: "Artist of the month",
      title: "Discover Chroma",
      button: "View artworks",
    },
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentSlideData = slides[currentSlide];
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className={" relative min-h-[60vh] overflow-hidden"}>
        {/* Full-width background image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${currentSlideData.artwork})`,
            backgroundBlendMode: "multiply",
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
                onClick={() => navigate("/artwork/1")}
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

      {/* Bottom Text Section */}
      <div className="py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className=" text-balance font-bold text-2xl text-black">
            Buying and selling pieces of art online
          </h2>
          <h3 className="mb-6 font-semibold text-lg">
            Artalistic: the art marketplace
          </h3>
          <p className="mx-auto text-pretty text-gray-600 leading-relaxed">
            You are an amateur, collector, professional or artist and you wish
            to sell or purchase Modern and Contemporary Art Artalistic will help
            you and give you expert advise.
          </p>
        </div>
      </div>
    </div>
  );
}
