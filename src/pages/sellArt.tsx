import { ProtectedRoute } from "@/components/auth/protected-route"
import { SellArtForm } from "@/components/sellArtWork/sellArtForm"

export default function SellArtPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen">
                {/* Breadcrumb */}
                <div className="container mx-auto px-4 py-4">
                    <nav className="text-muted-foreground text-sm">
                        <a href="/" className="hover:text-foreground">
                            Home
                        </a>
                        <span className="mx-2">›</span>
                        <span className="text-foreground">Sell artwork</span>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    <SellArtForm />
                </div>
            </div>
        </ProtectedRoute>
    )
}
