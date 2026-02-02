import { useGetCategories } from "@/services/category/useGetCategories";
import { useNavigate } from "react-router-dom";

export function CategoriesSection() {
  const { data: categoriesData, isLoading } = useGetCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/buyart?categories=${categoryId}`);
  };

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Collection
          </h2>
          <p className="text-xl text-gray-600">
            Discover art across all mediums and styles
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-200 mb-3" />
                <div className="h-4 w-20 mx-auto rounded bg-gray-200 mb-2" />
                <div className="h-3 w-16 mx-auto rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoriesData?.slice(0, 6).map((category) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-center group-hover:text-red-700 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {(category.artworkCount || 0).toLocaleString()} works
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
