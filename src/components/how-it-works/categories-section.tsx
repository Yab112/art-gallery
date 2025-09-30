const categories = [
  { name: "Paintings", count: "15,000+", image: "/artwork-1.jpg" },
  { name: "Sculptures", count: "8,500+", image: "/artwork-2.jpg" },
  { name: "Photography", count: "12,000+", image: "/artwork-3.jpg" },
  { name: "Digital Art", count: "6,200+", image: "/artwork-4.jpg" },
  { name: "Prints", count: "25,000+", image: "/artwork-5.jpg" },
  { name: "Mixed Media", count: "4,800+", image: "/artwork-6.jpg" },
];

export function CategoriesSection() {
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-shadow">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-center">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {category.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
