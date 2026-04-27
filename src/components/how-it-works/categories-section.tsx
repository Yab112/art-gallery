import { useGetCategories } from "@/services/category/useGetCategories"
import { useNavigate } from "react-router-dom"

export function CategoriesSection() {
    const { data: categoriesData, isLoading } = useGetCategories()
    const navigate = useNavigate()

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/buyart?categories=${categoryId}`)
    }

    return (
        <div className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 lg:mb-16 text-left">
                    <h2 className="mb-4 font-bold text-2xl text-gray-900 lg:text-4xl">
                        Explore Our Collection
                    </h2>
                    <p className="text-base text-gray-500 lg:text-lg max-w-2xl">
                        Discover art across all mediums and styles
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="mb-3 aspect-square rounded-lg bg-gray-200" />
                                <div className="mx-auto mb-2 h-4 w-20 rounded bg-gray-200" />
                                <div className="mx-auto h-3 w-16 rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {categoriesData?.slice(0, 6).map((category) => (
                            <div
                                key={category.id}
                                className="group cursor-pointer"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <div className="group-hover:-translate-y-1 mb-3 aspect-square overflow-hidden rounded-lg bg-gray-200 transition-all duration-300 group-hover:shadow-lg">
                                    <img
                                        src={category.image || "/placeholder.svg"}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-center font-semibold text-gray-900 transition-colors group-hover:text-red-700 text-lg">
                                    {category.name}
                                </h3>
                                <p className="text-center text-gray-500 text-[13px]">
                                    {(category.artworkCount || 0).toLocaleString()} works
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
