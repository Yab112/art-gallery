"use client"

interface Category {
  id: string
  name: string
  image: string
  count: string
}

interface CategoryGridProps {
  categories: Category[]
  onCategorySelect: (categoryId: string) => void
}

export function CategoryGrid({ categories, onCategorySelect }: CategoryGridProps) {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {categories.map((category) => (
            <div key={category.id} className="group cursor-pointer" onClick={() => onCategorySelect(category.id)}>
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-[4/3]">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-sm text-black group-hover:text-gray-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500">{category.count} works</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
    