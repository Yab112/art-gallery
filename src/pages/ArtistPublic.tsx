import { AboutSection } from "@/components/artist/about-section";
import { ArtistProfile } from "@/components/artist/artist-profile";
import { ArtworkGrid } from "@/components/artist/artwork-grid";
import { FilterControls } from "@/components/artist/filter-controls";
import { ImageModal } from "@/components/artist/image-modal";
import { NavigationTabs } from "@/components/artist/navigation-tabs";
import { SimilarArtists } from "@/components/artist/similar-artists";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ArtistDetailPage() {
  const [activeTab, setActiveTab] = useState("artworks");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();

  return (
    <div className="b min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Carlos Jacanamijoy</span>
          </button>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 ">
        <ArtistProfile />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "artworks" && (
          <>
            <FilterControls />
            <ArtworkGrid onImageClick={setSelectedImage} />
          </>
        )}

        {activeTab === "about" && <AboutSection />}

        <SimilarArtists />

        {selectedImage && (
          <ImageModal
            src={selectedImage || "/placeholder.svg"}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  );
}
