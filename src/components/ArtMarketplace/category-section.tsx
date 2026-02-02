import type { Category } from "./artwork-types"

interface CategorySectionProps {
    categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
    return (
        <div className="px-8 pb-8">
            <div className="grid grid-cols-6 gap-4">
                {categories.map((category) => (
                    <div key={category.id} className="group cursor-pointer">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg">
                            <img
                                src={category.image || "/placeholder.svg"}
                                alt={category.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <h3 className="mt-2 font-medium text-black text-sm">{category.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    )
}
