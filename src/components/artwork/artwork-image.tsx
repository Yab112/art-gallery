import type React from "react"
import { useState, useRef } from "react"

interface ArtworkImageProps {
  src: string
  alt: string
  magnifierSize?: number
  magnificationLevel?: number
  highResSrc?: string // Optional higher resolution source for magnifier
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({
  src,
  alt,
  magnifierSize = 200,
  magnificationLevel = 3,
  highResSrc // Use high-res source for magnifier, fallback to src
}) => {
  const [imageError, setImageError] = useState(false)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if cursor is within image bounds
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPosition({ x: e.clientX, y: e.clientY })
      setImagePosition({ x, y })
      setShowMagnifier(true)
    } else {
      setShowMagnifier(false)
    }
  }

  const handleMouseLeave = () => {
    setShowMagnifier(false)
  }

  return (
    <>
      <div
        className="aspect-[4/5] overflow-hidden bg-gray-100 relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {imageError || !src ? (
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
              <p className="mt-2 text-gray-500 text-xs">No Image</p>
            </div>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Magnifier Lens */}
      {showMagnifier && !imageError && src && imageRef.current && (
        <div
          style={{
            position: 'fixed',
            left: `${magnifierPosition.x}px`,
            top: `${magnifierPosition.y}px`,
            pointerEvents: 'none',
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            transform: 'translate(-50%, -50%)',
            border: '5px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '50%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: `${imageRef.current.width * magnificationLevel}px`,
              height: `${imageRef.current.height * magnificationLevel}px`,
              backgroundImage: `url(${highResSrc || src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${imageRef.current.width * magnificationLevel}px ${imageRef.current.height * magnificationLevel}px`,
              backgroundPosition: `-${imagePosition.x * magnificationLevel - magnifierSize / 2}px -${imagePosition.y * magnificationLevel - magnifierSize / 2}px`,
            }}
          />
        </div>
      )}
    </>
  )
}
