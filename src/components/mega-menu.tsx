import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Palette, Camera, Monitor, Hammer, PenTool, Shirt, Layers, Image as ImageIcon, Brush, Building2, Sparkles, ChevronRight } from "lucide-react";
import { useGetCategories, type Category } from "@/services/category/useGetCategories";
import { useGetTalentTypes, type TalentType } from "@/services/talent-type/useGetTalentTypes";
import { cn } from "@/lib/utils";

interface MegaMenuProps {
  type: "artwork" | "artist";
  label: string;
  className?: string;
  mobileMode?: boolean;
  onItemClick?: () => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  painting: Palette,
  sculpture: Hammer,
  photography: Camera,
  "digital-art": Monitor,
  drawing: PenTool,
  print: ImageIcon,
  "mixed-media": Layers,
  installation: Building2,
  performance: Sparkles,
  "video-art": Monitor,
  textile: Shirt,
  ceramics: Brush,
};

// Icon mapping for talent types
const talentTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  painter: Palette,
  photographer: Camera,
  "digital-artist": Monitor,
  sculptor: Hammer,
  calligrapher: PenTool,
  "tattoo-artist": Brush,
  "fashion-designer": Shirt,
  "mixed-media": Layers,
  illustrator: ImageIcon,
  ceramicist: Brush,
  "street-artist": Sparkles,
  other: Sparkles,
};

export function MegaMenu({ type, label, className, mobileMode = false, onItemClick }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data - these are cached and prefetched on mount
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories();
  const { data: talentTypes = [], isLoading: talentTypesLoading } = useGetTalentTypes();

  // Close menu when clicking outside (only for desktop)
  useEffect(() => {
    if (mobileMode) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, mobileMode]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (mobileMode) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (mobileMode) return;
    // Small delay before closing to allow moving to menu
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    if (mobileMode) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMenuMouseLeave = () => {
    if (mobileMode) return;
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (mobileMode) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = () => {
    if (mobileMode) {
      setIsOpen(false);
      onItemClick?.();
    } else {
      setIsOpen(false);
    }
  };

  const isLoading = categoriesLoading || talentTypesLoading;

  // Calculate number of columns based on data length
  const getColumns = (count: number) => {
    if (count <= 4) return 2;
    if (count <= 8) return 4;
    return 4;
  };

  const navLink = type === "artwork" ? "/buyart" : "/artists";

  // Mobile Accordion Mode
  if (mobileMode) {
    return (
      <div className={cn("w-full", className)}>
        <button
          onClick={handleToggle}
          className="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 transition-colors py-2"
        >
          <span className="font-medium">{label}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              </div>
            ) : type === "artwork" ? (
              <>
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || Palette;
                  return (
                    <div key={category.id} className="ml-4 space-y-1">
                      <Link
                        to={`/buyart?category=${category.slug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1.5"
                        onClick={handleItemClick}
                      >
                        <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{category.name}</span>
                      </Link>
                      {category.artworkCount !== undefined && (
                        <div className="ml-6 text-xs text-gray-500">
                          {category.artworkCount} artworks
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {talentTypes.map((talentType) => {
                  const IconComponent = talentTypeIcons[talentType.slug] || Sparkles;
                  return (
                    <div key={talentType.id} className="ml-4 space-y-1">
                      <Link
                        to={`/artists?talentType=${talentType.slug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1.5"
                        onClick={handleItemClick}
                      >
                        <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{talentType.name}</span>
                      </Link>
                      {talentType.description && (
                        <div className="ml-6 text-xs text-gray-500 line-clamp-1">
                          {talentType.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop Mode
  return (
    <div
      ref={menuRef}
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={navLink}
        className={cn(
          "flex items-center gap-1 text-sm text-gray-700 transition-colors hover:text-gray-900",
          isOpen && "text-gray-900"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Link>

      {isOpen && (
        <div
          className="fixed left-1/2 -translate-x-1/2 top-[73px] z-50 w-[95vw] max-w-[1200px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : type === "artwork" ? (
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || Palette;
                  return (
                    <div key={category.id} className="space-y-1">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {category.name}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            to={`/buyart?category=${category.slug}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>Browse {category.name}</span>
                          </Link>
                        </li>
                        {category.artworkCount !== undefined && (
                          <li>
                            <span className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                                <span className="h-1 w-1 rounded-full bg-gray-400" />
                              </span>
                              <span>{category.artworkCount} artworks</span>
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {talentTypes.map((talentType) => {
                  const IconComponent = talentTypeIcons[talentType.slug] || Sparkles;
                  return (
                    <div key={talentType.id} className="space-y-1">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {talentType.name}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            to={`/artists?talentType=${talentType.slug}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>View {talentType.name}s</span>
                          </Link>
                        </li>
                        {talentType.description && (
                          <li>
                            <span className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                                <span className="h-1 w-1 rounded-full bg-gray-400" />
                              </span>
                              <span className="line-clamp-1">{talentType.description}</span>
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
