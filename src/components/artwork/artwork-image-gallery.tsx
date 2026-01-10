import type React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageModal } from "@/components/artist/image-modal";

interface ArtworkImageGalleryProps {
  photos: string[];
  alt: string;
}

export const ArtworkImageGallery: React.FC<ArtworkImageGalleryProps> = ({
  photos,
  alt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Filter out invalid photos
  const validPhotos = photos?.filter((photo) => photo && photo.trim() !== "") || [];
  
  // If no valid photos, show placeholder
  if (validPhotos.length === 0) {
    return (
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 rounded-lg">
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-xs text-gray-500">No Image</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPhoto = validPhotos[currentIndex];
  const hasMultiplePhotos = validPhotos.length > 1;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-lg group">
          {imageErrors.has(currentIndex) || !currentPhoto ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-xs text-gray-500">Image not available</p>
              </div>
            </div>
          ) : (
            <>
              <img
                src={currentPhoto}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={() => setIsModalOpen(true)}
                onError={() => handleImageError(currentIndex)}
              />

              {/* Navigation Arrows - Only show if multiple photos */}
              {hasMultiplePhotos && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-md"
                    onClick={handlePrevious}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-md"
                    onClick={handleNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Counter - Only show if multiple photos */}
              {hasMultiplePhotos && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {currentIndex + 1} / {validPhotos.length}
                </div>
              )}
            </>
          )}
        </div>

        {/* Thumbnail Navigation - Only show if multiple photos */}
        {hasMultiplePhotos && validPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {validPhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-red-600 ring-2 ring-red-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                {imageErrors.has(index) ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isModalOpen && currentPhoto && !imageErrors.has(currentIndex) && (
        <ImageModal
          src={currentPhoto}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};





