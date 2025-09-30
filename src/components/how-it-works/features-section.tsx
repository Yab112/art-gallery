import { Users, Star, Heart } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Trusted Community",
    description:
      "Join thousands of collectors, artists, and galleries worldwide",
  },
  {
    icon: Star,
    title: "Curated Quality",
    description: "Every artwork is carefully vetted by our expert team",
  },
  {
    icon: Heart,
    title: "Passion-Driven",
    description: "Built by art lovers, for art lovers",
  },
];

export function FeaturesSection() {
  return (
    <div className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Artalistic?
          </h2>
          <p className="text-xl text-gray-600">
            We're more than just a marketplace - we're your partner in building
            a meaningful art collection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
