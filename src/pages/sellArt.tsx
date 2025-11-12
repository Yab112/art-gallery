import { SellArtForm } from "@/components/sellArtWork/sellArtForm";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SellArtPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground">
              Home
            </a>
            <span className="mx-2">›</span>
            <span className="text-foreground">Sell artwork</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <SellArtForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
