"use client"

import { ArtistProfile } from "@/components/artist/artist-profile"
import { ArtworkGrid } from "@/components/artist/artwork-grid"
import { NavigationTabs } from "@/components/artist/navigation-tabs"
import { FilterControls } from "@/components/artist/filter-controls"
import { AboutSection } from "@/components/artist/about-section"
import { SimilarArtists } from "@/components/artist/similar-artists"
import { ImageModal } from "@/components/artist/image-modal"
import { useState } from "react"

export default function ArtistDetailPage() {
  const [activeTab, setActiveTab] = useState("artworks")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="container mx-auto    py-8 w-full">
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
          <ImageModal src={selectedImage || "/placeholder.svg"} onClose={() => setSelectedImage(null)} />
        )}
      </div>
    </div>
  )
}
