import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { favoriteKeys } from "@/queries/queryKeys";
import { useCheckFavorite } from "@/queries/favoriteQueries";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite";

interface AnimatedFavoriteButtonProps {
  artworkId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "button" | "icon";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export function AnimatedFavoriteButton({
  artworkId,
  size = "md",
  className,
  variant = "button",
}: AnimatedFavoriteButtonProps) {
  const queryClient = useQueryClient();
  const { data: favoriteCheck } = useCheckFavorite(artworkId);
  const [, forceUpdate] = useState({});
  
  // Subscribe to cache changes to get optimistic updates
  useEffect(() => {
    const queryKey = favoriteKeys.check(artworkId);
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey && 
          JSON.stringify(event.query.queryKey) === JSON.stringify(queryKey)) {
        forceUpdate({});
      }
    });
    return unsubscribe;
  }, [queryClient, artworkId]);
  
  // Read from query cache to get the latest state (including optimistic updates)
  const cacheData = queryClient.getQueryData<{ success: boolean; isFavorite: boolean }>(
    favoriteKeys.check(artworkId)
  );
  
  const isFavorited = cacheData?.isFavorite ?? favoriteCheck?.isFavorite ?? false;
  const { addFavorite } = useAddFavorite();
  const { removeFavorite } = useRemoveFavorite();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [localIsFavorited, setLocalIsFavorited] = useState(isFavorited);

  // Sync with prop changes, but respect user interactions
  useEffect(() => {
    if (!hasUserInteracted) {
      setLocalIsFavorited(isFavorited);
    } else if (!isAnimating && isFavorited === localIsFavorited) {
      setHasUserInteracted(false);
    }
  }, [isFavorited, isAnimating, localIsFavorited, hasUserInteracted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newFavoritedState = !localIsFavorited;
    
    // Mark that user has interacted
    setHasUserInteracted(true);
    
    // Update state immediately for instant feedback
    setLocalIsFavorited(newFavoritedState);
    setIsAnimating(true);

    // Generate particles for like animation (Instagram-style)
    if (newFavoritedState) {
      const particleCount = 12;
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        return {
          id: Date.now() + i,
          x: 50,
          y: 50,
          angle,
          distance,
        };
      });
      setParticles(newParticles);

      // Remove particles after animation
      setTimeout(() => {
        setParticles([]);
      }, 1000);
    } else {
      // Clear particles when unfavoriting
      setParticles([]);
    }

    // Trigger the mutation (this will update the query cache via optimistic updates)
    try {
      if (newFavoritedState) {
        await addFavorite(artworkId);
      } else {
        await removeFavorite(artworkId);
      }
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Failed to toggle favorite:", error);
    }

    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative rounded-full transition-all duration-200",
          "hover:bg-gray-100 active:scale-95",
          "focus:outline-none",
          buttonSizeClasses[size],
          className
        )}
        aria-label={localIsFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <div className="relative">
          <Heart
            className={cn(
              sizeClasses[size],
              "transition-all duration-200",
              localIsFavorited
                ? "fill-red-500 text-red-500"
                : "fill-none text-gray-600"
            )}
            style={{
              transform: isAnimating && localIsFavorited ? "scale(1.4)" : "scale(1)",
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.2s ease-out, color 0.2s ease-out",
            }}
          />

          {/* Particles Animation */}
          {particles.map((particle) => {
            const endX = 50 + Math.cos(particle.angle) * particle.distance;
            const endY = 50 + Math.sin(particle.angle) * particle.distance;
            return (
              <div
                key={particle.id}
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
              >
                <div
                  className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                  style={{
                    animation: `particle-${particle.id} 0.8s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.1}s`,
                  }}
                />
                <style>{`
                  @keyframes particle-${particle.id} {
                    0% {
                      transform: translate(0, 0) scale(1);
                      opacity: 1;
                    }
                    100% {
                      transform: translate(${endX - 50}%, ${endY - 50}%) scale(0);
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            );
          })}

          {/* Ripple Effect */}
          {isAnimating && localIsFavorited && (
            <div className="absolute inset-0 -m-3 pointer-events-none">
              <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ripple" />
              <div
                className="absolute inset-0 rounded-full bg-red-500/30 animate-ripple"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="absolute inset-0 rounded-full bg-red-500/20 animate-ripple"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900",
        localIsFavorited && "text-red-500",
        className
      )}
      aria-label={localIsFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <div className="relative">
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200",
            localIsFavorited
              ? "fill-current text-red-500"
              : "fill-none"
          )}
          style={{
            transform: isAnimating && localIsFavorited ? "scale(1.4)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.2s ease-out, color 0.2s ease-out",
          }}
        />

        {/* Particles Animation */}
        {particles.map((particle) => {
          const endX = 50 + Math.cos(particle.angle) * particle.distance;
          const endY = 50 + Math.sin(particle.angle) * particle.distance;
          return (
            <div
              key={particle.id}
              className="absolute inset-0 pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            >
              <div
                className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                style={{
                  animation: `particle-${particle.id} 0.8s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.1}s`,
                }}
              />
              <style>{`
                @keyframes particle-${particle.id} {
                  0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(${endX - 50}%, ${endY - 50}%) scale(0);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          );
        })}

        {/* Ripple Effect */}
        {isAnimating && localIsFavorited && (
          <div className="absolute inset-0 -m-3 pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ripple" />
            <div
              className="absolute inset-0 rounded-full bg-red-500/30 animate-ripple"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="absolute inset-0 rounded-full bg-red-500/20 animate-ripple"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        )}
      </div>
      {variant === "button" && <span>Save</span>}
    </button>
  );
}

