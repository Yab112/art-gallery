import { Heart, Star, Users } from "lucide-react"

const features = [
    {
        icon: Users,
        title: "Trusted Community",
        description: "Join thousands of collectors, artists, and galleries worldwide"
    },
    {
        icon: Star,
        title: "Curated Quality",
        description: "Every artwork is carefully vetted by our expert team"
    },
    {
        icon: Heart,
        title: "Passion-Driven",
        description: "Built by art lovers, for art lovers"
    }
]

export function FeaturesSection() {
    return (
        <div className="bg-gray-50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-bold text-3xl text-gray-900 lg:text-4xl">
                        Why Choose Artopia?
                    </h2>
                    <p className="text-gray-600 text-xl">
                        We're more than just a marketplace - we're your partner in building a
                        meaningful art collection
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div key={index} className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <Icon className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
