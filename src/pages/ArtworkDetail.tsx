import { ArtworkImage } from "@/components/artwork/Artwork-image";
import { ArtworkActions } from "@/components/artwork/artwork-actions";
import { ArtworkCollapsibles } from "@/components/artwork/artwork-collapsibles";
import { ArtworkDetails } from "@/components/artwork/artwork-details";
import { ArtworkGalleryInfo } from "@/components/artwork/artwork-galleryInfo";
import { ArtworkPurchase } from "@/components/artwork/artwork-purchase";
import { RelatedArtworks } from "@/components/artwork/related-artwork";
// import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArtworkAbout } from "../components/artwork/artwork-about";

export default function ArtworkDetailPage() {
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isGuaranteeOpen, setIsGuaranteeOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Niina Villanueva</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Artwork Image */}
          <div className="space-y-6">
            <ArtworkImage
              src="/artwork-4.jpg"
              alt="Memento Mori Pajaro by Niina Villanueva"
            />
            <ArtworkActions
              isSaved={isSaved}
              onSave={() => setIsSaved(!isSaved)}
            />
          </div>
          {/* Right Column - Artwork Details */}
          <div className="space-y-4">
            <ArtworkDetails />
            <ArtworkPurchase />
            <ArtworkCollapsibles
              isShippingOpen={isShippingOpen}
              setIsShippingOpen={setIsShippingOpen}
              isGuaranteeOpen={isGuaranteeOpen}
              setIsGuaranteeOpen={setIsGuaranteeOpen}
            />
            <ArtworkGalleryInfo />
          </div>
        </div>
        <ArtworkAbout />
        <RelatedArtworks />
      </div>
    </div>
  );
}
