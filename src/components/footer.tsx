import useAxiosAuth from "@/hooks/use-axios-auth"
import {
    Brush,
    Camera,
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Palette,
    Phone,
    Twitter
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { usePlatformSettings } from "@/queries/settingsQueries"

function Logo() {
    const [imageError, setImageError] = useState(false)
    const { data: platformSettings } = usePlatformSettings()
    const siteName = platformSettings?.settings?.siteName

    if (imageError) {
        return <span className="font-bold text-2xl text-red-500">{siteName?.toLowerCase()}</span>
    }

    return (
        <img
            src="/mainlogo.png"
            alt="Logo"
            className="h-10 w-auto"
            onError={() => setImageError(true)}
        />
    )
}


const socialLinks = [
    {
        name: "Instagram",
        icon: Instagram,
        href: "https://instagram.com/artopia"
    },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/artopia" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/artopia" }
]

const contactInfo = [
    { icon: Mail, text: "hello@artopia.com" },
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: MapPin, text: "123 Art District, Creative City, NY 10001" }
]

export function Footer() {
    const { data: platformSettings } = usePlatformSettings()
    const siteName = platformSettings?.settings?.siteName

    const footerSections = [
        {
            title: "Discover Art",
            icon: Palette,
            links: [
                { label: "Art Marketplace", href: "/buyart" },
                { label: "Browse Collections", href: "/buyart" },
                { label: "Featured Artists", href: "/artists" },
                { label: "New Arrivals", href: "/buyart?sort=newest" },
                { label: "Blogs", href: "/blog" }
            ]
        },
        {
            title: "For Artists",
            icon: Brush,
            links: [
                { label: "Sell Your Art", href: "/sellart" },
                { label: "Artist Feed", href: "/feed" },
                { label: "My Artworks", href: "/profile/my-artworks" },
                { label: "My Blogs", href: "/blog/my-blogs" },
                { label: "My Collections", href: "/profile/collections" }
            ]
        },
        {
            title: "Learn & Explore",
            icon: Camera,
            links: [
                { label: "Art Blog", href: "/blog" },
                { label: `About ${siteName}`, href: "/how-it-works" }
            ]
        }
    ]

    const [email, setEmail] = useState("")
    const [isSubscribing, setIsSubscribing] = useState(false)
    const axiosAuth = useAxiosAuth()

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !email.trim()) {
            toast.error("Please enter a valid email address")
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSubscribing(true)
        try {
            const response = await axiosAuth.post("/profile/subscribe-newsletter", {
                email: email.trim()
            })

            if (response.data.success) {
                toast.success("Successfully subscribed to newsletter!")
                setEmail("")
            } else {
                toast.error(response.data.message || "Failed to subscribe")
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to subscribe. Please try again."
            toast.error(errorMessage)
        } finally {
            setIsSubscribing(false)
        }
    }

    return (
        <footer className="w-full bg-white text-gray-900">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <Logo />
                            <p className="mt-3 mb-4 text-gray-600 text-sm leading-relaxed">
                                Your gateway to the world of contemporary art. Discover, collect,
                                and connect with exceptional artworks and talented artists from
                                around the globe.
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="mb-4 space-y-2">
                            {contactInfo.map((contact, index) => {
                                const Icon = contact.icon
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-gray-600 text-sm"
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0 text-red-500" />
                                        <span className="truncate">{contact.text}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
                                        aria-label={social.name}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {footerSections.map((section, index) => {
                        const Icon = section.icon
                        return (
                            <div key={index}>
                                <div className="mb-3 flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-red-500" />
                                    <h3 className="font-semibold text-gray-900 text-sm">
                                        {section.title}
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <Link
                                                to={link.href}
                                                className="block text-gray-600 text-sm transition-colors hover:text-gray-900"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="border-gray-200 border-t bg-gray-50/50">
                <div className="mx-auto max-w-7xl px-4 py-10">
                    <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
                        <div className="max-w-xl text-center lg:text-left">
                            <h3 className="mb-2 font-bold text-xl text-gray-900 md:text-2xl">
                                Stay Updated with {siteName}
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base">
                                Get the latest art news, new artist features, and exclusive offers
                                delivered straight to your inbox.
                            </p>
                        </div>
                        <form
                            onSubmit={handleSubscribe}
                            className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:gap-1"
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubscribing}
                                className="w-full flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 text-sm placeholder-gray-500 transition-all focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="w-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-sm text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto whitespace-nowrap"
                            >
                                {isSubscribing ? "Subscribing..." : "Subscribe"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-gray-200 border-t bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
                        <div className="text-center lg:text-left">
                            <p className="text-gray-600 text-sm">
                                © {new Date().getFullYear()} {siteName}. All rights reserved. Making
                                art accessible to everyone.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-xs">
                            <Link to="/" className="transition-colors hover:text-gray-900">
                                Privacy Policy
                            </Link>
                            <Link to="/" className="transition-colors hover:text-gray-900">
                                Terms of Service
                            </Link>
                            <Link to="/" className="transition-colors hover:text-gray-900">
                                Cookie Policy
                            </Link>
                            <Link to="/" className="transition-colors hover:text-gray-900">
                                Accessibility
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
