import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  image: string;
  count: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryIds?: string[];
}

export function CategoryGrid({
  categories,
  onCategorySelect,
  selectedCategoryIds = [],
}: CategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasMovedRef = useRef(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 176; // Width of one card (160px) plus gap (16px)
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    hasMovedRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "auto";
    }
    // Reset after a short delay to allow onClick to check it
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    
    // Check if user actually moved (more than 5px threshold)
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="px-4 pb-0">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-0">
          {/* Navigation Arrows - Centered relative to image section */}
          {/* Image is w-40 (160px) with aspect-[4/3], so height is 120px. Center is at 60px */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-[60px] -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-gray-50 h-10 w-10"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-[60px] -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-gray-50 h-10 w-10"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <div
                    key={category.id}
                    className={`group cursor-pointer flex-shrink-0 w-40 ${
                      isSelected ? "opacity-100" : ""
                    }`}
                    onClick={(e) => {
                      // Prevent click if user was dragging
                      if (!hasMovedRef.current) {
                        onCategorySelect(category.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onCategorySelect(category.id);
                      }
                    }}
                  >
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div
                        className={`absolute inset-0 transition-colors duration-300 ${
                          isSelected
                            ? "bg-red-700/40 ring-2 ring-red-700"
                            : "bg-black/20 group-hover:bg-black/40"
                        }`}
                      />
                      {/* Checkmark indicator for selected categories */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-red-700 text-white rounded-full p-1.5 shadow-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3
                      className={`font-semibold text-sm transition-colors ${
                        isSelected
                          ? "text-red-700"
                          : "text-black group-hover:text-gray-600"
                      }`}
                    >
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-xs">{category.count} works</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
