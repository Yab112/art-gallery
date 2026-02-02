import { Button } from "@/components/ui/button"
import { Eye, Heart, ShoppingBag } from "lucide-react"

interface ArtistCardProps {
    name: string
    nationality?: string
    birthYear?: string
    deathYear?: string
    avatar: string
    artworkCount?: number
    totalViews?: number
    totalLikes?: number
    totalSales?: number
    salesCount?: number
    totalEarnings?: number
    onFollow?: () => void
}

export function ArtistCard({
    name,
    nationality,
    birthYear,
    deathYear,
    avatar,
    artworkCount,
    totalViews,
    totalLikes,
    totalSales,
    salesCount,
    totalEarnings,
    onFollow
}: ArtistCardProps) {
    const formatLifespan = () => {
        if (!nationality && !birthYear) return ""

        let result = ""
        if (nationality) result += nationality
        if (birthYear) {
            if (nationality) result += ", "
            result += deathYear ? `${birthYear}-${deathYear}` : `b.${birthYear}`
        }
        return result
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`
        }
        return num.toString()
    }

    return (
        <div className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-shadow duration-300 hover:shadow-lg">
            {/* Circular Avatar */}
            <div className="relative mb-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 transition-colors group-hover:border-gray-300">
                    <img
                        src={avatar || "/placeholder.svg"}
                        alt={`${name} - Artist`}
                        className="h-full w-full object-cover"
                    />
                </div>
                {salesCount !== undefined && salesCount > 0 && (
                    <div className="-bottom-1 -right-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white text-xs shadow-lg">
                        {salesCount}
                    </div>
                )}
            </div>

            {/* Artist Name */}
            <div className="mb-3">
                <h3 className="mb-1 cursor-pointer font-semibold text-gray-900 text-lg transition-colors hover:text-gray-700">
                    {name}
                </h3>
                {formatLifespan() && <p className="text-gray-500 text-sm">{formatLifespan()}</p>}
            </div>

            {/* Metrics Grid */}
            <div className="mb-4 grid w-full grid-cols-2 gap-3 text-sm">
                {artworkCount !== undefined && (
                    <div className="flex flex-col items-center rounded bg-gray-50 p-2">
                        <span className="font-bold text-base text-gray-900">{artworkCount}</span>
                        <span className="text-gray-600 text-xs">Artworks</span>
                    </div>
                )}
                {totalViews !== undefined && totalViews > 0 && (
                    <div className="flex flex-col items-center rounded bg-gray-50 p-2">
                        <div className="mb-1 flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="font-bold text-gray-900">
                                {formatNumber(totalViews)}
                            </span>
                        </div>
                        <span className="text-gray-600 text-xs">Views</span>
                    </div>
                )}
                {totalLikes !== undefined && totalLikes > 0 && (
                    <div className="flex flex-col items-center rounded bg-gray-50 p-2">
                        <div className="mb-1 flex items-center gap-1">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            <span className="font-bold text-gray-900">
                                {formatNumber(totalLikes)}
                            </span>
                        </div>
                        <span className="text-gray-600 text-xs">Likes</span>
                    </div>
                )}
                {totalSales !== undefined && totalSales > 0 && (
                    <div className="col-span-2 flex flex-col items-center rounded bg-green-50 p-2">
                        <div className="mb-1 flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-700">
                                {formatCurrency(totalSales)}
                            </span>
                        </div>
                        <span className="text-green-600 text-xs">Total Sales</span>
                    </div>
                )}
            </div>

            {/* Profile Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onFollow}
                className="w-full rounded-full border-gray-300 bg-transparent hover:bg-gray-50"
            >
                View Profile
            </Button>
        </div>
    )
}
