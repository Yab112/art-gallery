import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            How <span className="text-red-700">Artalistic</span> Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your trusted marketplace for discovering, buying, and selling modern
            and contemporary art. Whether you're a collector, artist, or
            gallery, we make art accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white">
              Start Collecting
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Sell Your Art
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
