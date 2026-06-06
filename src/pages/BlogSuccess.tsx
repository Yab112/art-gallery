import { Button } from "@/components/ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function BlogSuccessPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const blogTitle = (location.state as any)?.blogTitle || "Your Story"

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
            <div className="w-full max-w-xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="mb-8 inline-block font-black text-red-700 text-[10px] uppercase tracking-[0.5em]">
                        Success
                    </span>
                    
                    <h1 className="mb-6 font-black text-4xl text-gray-900 uppercase tracking-tighter md:text-6xl">
                        Story Submitted.
                    </h1>
                    
                    <p className="mb-12 font-medium text-gray-400 text-sm uppercase tracking-widest italic">
                        "{blogTitle}"
                    </p>

                    <div className="mb-16 space-y-2">
                        <p className="font-bold text-gray-900 text-xs uppercase tracking-[0.2em]">
                            Status: Pending Curation
                        </p>
                        <p className="mx-auto max-w-xs text-gray-400 text-[11px] leading-relaxed tracking-wide">
                            Our editorial team will review your contribution within 48 hours.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
                        <button
                            onClick={() => navigate("/blog")}
                            className="font-black text-gray-900 text-[11px] uppercase tracking-[0.3em] transition-colors hover:text-red-700"
                        >
                            Back to Journal
                        </button>
                        <div className="hidden h-1 w-1 rounded-full bg-gray-200 md:block" />
                        <button
                            onClick={() => navigate("/buyart")}
                            className="font-black text-gray-900 text-[11px] uppercase tracking-[0.3em] transition-colors hover:text-red-700"
                        >
                            Return to Gallery
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
