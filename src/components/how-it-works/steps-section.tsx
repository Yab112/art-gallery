import { AnimatePresence, motion } from "framer-motion"
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
                    <h2 className="mb-4 font-bold text-2xl text-gray-900 lg:text-4xl">
                        Four Simple Steps
                    </h2>
                    <p className="text-base text-gray-500 lg:text-lg">
                        From discovery to delivery, we've made buying art simple and secure
                    </p>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start gap-12">
                    {/* Steps List */}
                    <div className="space-y-4 lg:space-y-6">
                        {steps.map((step) => {
                            const Icon = step.icon
                            const isActive = activeStep === step.id

                            return (
                                <motion.div
                                    key={step.id}
                                    layout
                                    className="group"
                                >
                                    <div
                                        onMouseEnter={() => !window.matchMedia("(max-width: 1024px)").matches && setActiveStep(step.id)}
                                        className={`rounded-xl border-2 p-6 transition-all duration-500 ${isActive
                                            ? "lg:border-red-500 lg:bg-red-50/50 lg:shadow-sm border-gray-100 bg-white"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${isActive
                                                    ? "lg:bg-red-500 lg:text-white lg:shadow-lg lg:shadow-red-200 bg-gray-100 text-gray-400"
                                                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                                                    }`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3
                                                    className={`font-semibold text-lg lg:text-xl transition-colors duration-500 ${isActive ? "lg:text-red-700 text-gray-900" : "text-gray-900"
                                                        }`}
                                                >
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-1">{step.description}</p>

                                                {/* Mobile Details */}
                                                <div className="lg:hidden mt-6">
                                                    <div className="pt-4 border-t border-red-100">
                                                        <ul className="space-y-3">
                                                            {step.details.map((detail, index) => (
                                                                <li key={index} className="flex items-start gap-3">
                                                                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                                                                    <span className="text-gray-600 text-sm leading-relaxed">{detail}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Step Details Preview (Desktop Only) */}
                    <div className="hidden lg:block relative rounded-2xl bg-gray-50/50 p-10 border border-gray-100 min-h-[440px] overflow-hidden">
                        <AnimatePresence mode="wait">
                            {steps.map((step) => {
                                const Icon = step.icon
                                const isActive = activeStep === step.id

                                if (!isActive) return null

                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="absolute inset-x-10"
                                    >
                                        <div className="mb-10 flex items-center gap-6">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-xl shadow-red-100/50">
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-3xl text-gray-900 tracking-tight">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-500 text-base mt-1">{step.description}</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-6">
                                            {step.details.map((detail, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                                                    className="flex items-start gap-5 py-1"
                                                >
                                                    <CheckCircle className="mt-1.5 h-6 w-6 flex-shrink-0 text-green-500/80" />
                                                    <span className="text-gray-700 text-lg font-medium leading-relaxed">{detail}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
