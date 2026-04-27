import { cn } from "@/lib/utils"
import { useGetCategories } from "@/services/category/useGetCategories"
import { useGetTalentTypes } from "@/services/talent-type/useGetTalentTypes"
import {
    ChevronDown,
    ChevronRight,
    Image as ImageIcon
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

interface MegaMenuProps {
    type: "artwork" | "artist"
    label: string
    className?: string
    mobileMode?: boolean
    onItemClick?: () => void
}



export function MegaMenu({
    type,
    label,
    className,
    mobileMode = false,
    onItemClick
}: MegaMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [activeItem, setActiveItem] = useState<any>(null)
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

    const handleImageError = (id: string) => {
        setBrokenImages(prev => ({ ...prev, [id]: true }))
    }

    // Fetch data - these are cached and prefetched on mount
    const { data: categories = [], isLoading: categoriesLoading } = useGetCategories()
    const { data: talentTypes = [], isLoading: talentTypesLoading } = useGetTalentTypes()

    // Close menu when clicking outside or scrolling (only for desktop)
    useEffect(() => {
        if (mobileMode) return

        const handleClose = () => {
            setIsOpen(false)
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleClose()
            }
        }

        const handleScroll = () => {
            if (isOpen) {
                // Using a small threshold to avoid accidental closures on tiny jitters
                if (window.scrollY > 10) {
                    handleClose()
                }
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            window.addEventListener("scroll", handleScroll, { passive: true })
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [isOpen, mobileMode])

    // Clear timeout and pre-load images
    useEffect(() => {
        const preLoadImages = (items: any[]) => {
            items.forEach(item => {
                const imgUrl = (item as any).image || (item as any).icon
                if (imgUrl) {
                    const img = new Image()
                    img.src = imgUrl
                }
            })
        }

        if (categories.length > 0) {
            preLoadImages(categories)
            if (!activeItem) setActiveItem(categories[0])
        }
        if (talentTypes.length > 0) {
            preLoadImages(talentTypes)
            if (!activeItem) setActiveItem(talentTypes[0])
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [categories, talentTypes, activeItem])

    const handleMouseEnter = () => {
        if (mobileMode) return
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        if (mobileMode) return
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 150) // Small delay to allow moving mouse to the dropdown
    }

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(!isOpen)
    }


    const handleItemClick = () => {
        if (mobileMode) {
            setIsOpen(false)
            onItemClick?.()
        } else {
            setIsOpen(false)
        }
    }

    const isLoading = categoriesLoading || talentTypesLoading

    // Calculate number of columns based on data length

    const navLink = type === "artwork" ? "/buyart" : "/artists"

    // Mobile Accordion Mode
    if (mobileMode) {
        return (
            <div className={cn("w-full", className)}>
                <div className="flex items-center justify-between">
                    <Link
                        to={navLink}
                        onClick={() => {
                            setIsOpen(false)
                            onItemClick?.()
                        }}
                        className="flex-1 py-2 text-left text-gray-700 transition-colors hover:text-gray-900"
                    >
                        <span className="font-medium">{label}</span>
                    </Link>
                    <button
                        onClick={handleToggle}
                        className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:text-gray-900"
                    >
                        <ChevronRight
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isOpen && "rotate-90"
                            )}
                        />
                    </button>
                </div>

                {isOpen && (
                    <div className="mt-2 space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            </div>
                        ) : type === "artwork" ? (
                            <>
                                {categories.map((category) => (
                                    <div key={category.id} className="ml-4 space-y-1">
                                        <Link
                                            to={`/buyart?category=${category.slug}`}
                                            className="block py-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900"
                                            onClick={handleItemClick}
                                        >
                                            <span>{category.name}</span>
                                        </Link>
                                        {category.artworkCount !== undefined && (
                                            <div className="text-gray-400 text-[11px]">
                                                {category.artworkCount} artworks
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {talentTypes.map((talentType) => (
                                    <div key={talentType.id} className="ml-4 space-y-1">
                                        <Link
                                            to={`/artists?talentType=${talentType.slug}`}
                                            className="block py-1.5 text-gray-600 text-sm transition-colors hover:text-gray-900"
                                            onClick={handleItemClick}
                                        >
                                            <span>{talentType.name}</span>
                                        </Link>
                                        {talentType.description && (
                                            <div className="line-clamp-1 text-gray-400 text-[11px]">
                                                {talentType.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Desktop Mode
    return (
        <div
            ref={menuRef}
            className={cn("relative flex items-center gap-1", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                to={navLink}
                className={cn(
                    "py-2 text-gray-700 text-sm transition-colors hover:text-gray-900",
                    isOpen && "text-gray-900"
                )}
                onClick={() => setIsOpen(false)}
            >
                {label}
            </Link>
            <button
                onClick={handleToggle}
                className={cn(
                    "flex h-8 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900",
                    isOpen && "bg-gray-100 text-gray-900"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <ChevronDown
                    className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="fixed top-[65px] left-0 right-0 z-50 w-full border-b border-gray-100 bg-[#FAF7F2] shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-top-0 duration-300">
                    <div className="mx-auto flex max-w-7xl">
                        {/* Main Grid Section */}
                        <div className="flex-1 px-12 py-10">
                            {isLoading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-400" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
                                        {(type === "artwork" ? categories : talentTypes).map((item) => (
                                            <Link
                                                key={item.id}
                                                to={type === "artwork" ? `/buyart?category=${item.slug}` : `/artists?talentType=${item.slug}`}
                                                className="group flex items-center gap-2 font-medium text-gray-900 text-sm tracking-tight transition-all duration-200 hover:translate-x-1 hover:text-red-600"
                                                onClick={() => setIsOpen(false)}
                                                onMouseEnter={() => {
                                                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                                                    setActiveItem(item)
                                                }}
                                            >
                                                <span className={cn(
                                                    "h-0.5 bg-red-600 transition-all duration-300",
                                                    activeItem?.id === item.id ? "w-2" : "w-0 group-hover:w-2"
                                                )} />
                                                <span className={cn(
                                                    "transition-colors duration-200",
                                                    activeItem?.id === item.id ? "text-red-600" : ""
                                                )}>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-12 border-t border-gray-50 pt-6">
                                        <Link
                                            to={navLink}
                                            className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-red-600"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Explore All {label} —
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Featured Sidebar */}
                        <div className="w-[300px] border-l border-gray-100 bg-white/30 p-10">
                            <div className="group cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                    {/* No Default Image - Replaced by dynamic activeItem */}


                                    {/* Dynamic Image Stack */}
                                    {(type === "artwork" ? (categories as any[]) : (talentTypes as any[])).map((item) => {
                                        const hasValidImage = (item.image || item.icon) && !brokenImages[item.id];

                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "absolute inset-0 h-full w-full transition-all duration-500 ease-in-out",
                                                    activeItem?.id === item.id ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                                                )}
                                            >
                                                {hasValidImage ? (
                                                    <img
                                                        src={item.image || item.icon}
                                                        alt={item.name}
                                                        onError={() => handleImageError(item.id)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-300">
                                                        <ImageIcon className="mb-2 h-10 w-10 opacity-20" />
                                                        <span className="font-bold text-[10px] uppercase tracking-widest opacity-30">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
                                        {type === "artwork" ? "Category" : "Artist Type"}
                                    </span>
                                    <h4 className="font-semibold text-gray-900 text-lg leading-tight transition-colors group-hover:text-red-600">
                                        {activeItem?.name}
                                    </h4>
                                    <p className="line-clamp-3 text-gray-500 text-xs leading-relaxed">
                                        {activeItem?.description || `Explore our hand-picked selection of ${activeItem?.name || 'modern art'}.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}