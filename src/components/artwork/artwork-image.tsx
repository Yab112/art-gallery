import type React from "react";

interface ArtworkImageProps {
  src: string;
  alt: string;
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({ src, alt }) => (
  <div className="aspect-[4/5] overflow-hidden bg-gray-100">
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  </div>
);
