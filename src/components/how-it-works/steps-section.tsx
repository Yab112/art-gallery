import { useState } from "react";
import { CheckCircle, Search, Shield, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Discover Art",
    description:
      "Browse thousands of artworks from galleries, artists, and collectors worldwide",
    icon: Search,
    details: [
      "Explore by category, artist, or style",
      "Use advanced filters to find exactly what you want",
      "View high-resolution images and detailed descriptions",
      "Read artist biographies and artwork provenance",
    ],
  },
  {
    id: 2,
    title: "Connect & Verify",
    description:
      "Connect with sellers and verify authenticity through our secure platform",
    icon: Shield,
    details: [
      "All artworks come with authenticity certificates",
      "Secure messaging with verified sellers",
      "Expert authentication and appraisal services",
      "30-day return guarantee on all purchases",
    ],
  },
  {
    id: 3,
    title: "Purchase Safely",
    description:
      "Complete your purchase with confidence using our secure payment system",
    icon: CreditCard,
    details: [
      "Multiple secure payment options",
      "Escrow protection until delivery",
      "Insurance coverage for high-value items",
      "Transparent pricing with no hidden fees",
    ],
  },
  {
    id: 4,
    title: "Receive & Enjoy",
    description:
      "Get your artwork delivered safely and start building your collection",
    icon: Truck,
    details: [
      "Professional packaging and shipping",
      "Worldwide delivery with tracking",
      "White-glove installation service available",
      "Lifetime support for your collection",
    ],
  },
];

export function StepsSection() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Four Simple Steps
          </h2>
          <p className="text-xl text-gray-600">
            From discovery to delivery, we've made buying art simple and secure
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps Navigation */}
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isActive
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          isActive ? "text-red-700" : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Details */}
          <div className="bg-gray-50 rounded-2xl p-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`transition-all duration-300 ${
                    isActive ? "opacity-100 block" : "opacity-0 hidden"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
