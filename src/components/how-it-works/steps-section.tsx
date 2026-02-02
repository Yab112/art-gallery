import { CheckCircle, CreditCard, Search, Shield, Truck } from "lucide-react"
import { useState } from "react"

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
            "Read artist biographies and artwork provenance"
        ]
    },
    {
        id: 2,
        title: "Connect & Verify",
        description: "Connect with sellers and verify authenticity through our secure platform",
        icon: Shield,
        details: [
            "All artworks come with authenticity certificates",
            "Secure messaging with verified sellers",
            "Expert authentication and appraisal services",
            "30-day return guarantee on all purchases"
        ]
    },
    {
        id: 3,
        title: "Purchase Safely",
        description: "Complete your purchase with confidence using our secure payment system",
        icon: CreditCard,
        details: [
            "Multiple secure payment options",
            "Escrow protection until delivery",
            "Insurance coverage for high-value items",
            "Transparent pricing with no hidden fees"
        ]
    },
    {
        id: 4,
        title: "Receive & Enjoy",
        description: "Get your artwork delivered safely and start building your collection",
        icon: Truck,
        details: [
            "Professional packaging and shipping",
            "Worldwide delivery with tracking",
            "White-glove installation service available",
            "Lifetime support for your collection"
        ]
    }
]

export function StepsSection() {
    const [activeStep, setActiveStep] = useState(1)

    return (
        <div className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-bold text-3xl text-gray-900 lg:text-4xl">
                        Four Simple Steps
                    </h2>
                    <p className="text-gray-600 text-xl">
                        From discovery to delivery, we've made buying art simple and secure
                    </p>
                </div>

                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Steps Navigation */}
                    <div className="space-y-6">
                        {steps.map((step) => {
                            const Icon = step.icon
                            const isActive = activeStep === step.id

                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setActiveStep(step.id)}
                                    className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                                        isActive
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                                                isActive
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className={`mb-2 font-semibold text-xl ${
                                                    isActive ? "text-red-700" : "text-gray-900"
                                                }`}
                                            >
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Step Details */}
                    <div className="rounded-2xl bg-gray-50 p-8">
                        {steps.map((step) => {
                            const Icon = step.icon
                            const isActive = activeStep === step.id

                            return (
                                <div
                                    key={step.id}
                                    className={`transition-all duration-300 ${
                                        isActive ? "block opacity-100" : "hidden opacity-0"
                                    }`}
                                >
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl text-gray-900">
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        {step.details.map((detail, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                                <span className="text-gray-700">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
