import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <div className="bg-red-700 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Start Your Art Journey?
        </h2>
        <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
          Join thousands of art lovers who trust Artalistic for their collecting
          needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/buyart">
            <Button
              size="lg"
              className="bg-white text-red-700 hover:bg-gray-100"
            >
              Browse Artworks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/artists">
            <Button
              size="lg"
              variant="outline"
              className="border-white  bg-white text-red-700 hover:text-red-700"
            >
              Discover Artists
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
