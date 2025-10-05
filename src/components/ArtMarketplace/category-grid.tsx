interface Category {
  id: string;
  name: string;
  image: string;
  count: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  onCategorySelect,
}: CategoryGridProps) {
  return (
    <section className="px-4 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => onCategorySelect(category.id)}
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
                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40" />
              </div>
              <h3 className="font-semibold text-black text-sm transition-colors group-hover:text-gray-600">
                {category.name}
              </h3>
              <p className="text-gray-500 text-xs">{category.count} works</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
