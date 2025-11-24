import { Search, ShoppingCart, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { UserDropdown } from "./user-dropdown";
import { useState } from "react";
import { useCartSummary } from "@/queries/cartQueries";
import { useNavigate } from "react-router-dom";

function Logo() {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span className="text-4xl font-bold text-red-500 block ">artopia</span>
    );
  }

  return (
    <img 
      src="/mainlogo.png" 
      alt="Logo" 
      className="h-8 w-auto"
      onError={() => setImageError(true)}
    />
  );
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Fetch cart summary for count
  const { data: cartSummary } = useCartSummary();
  const cartCount = cartSummary?.totalItems || 0;

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/how-it-works"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>💡</span>
              <span className="text-sm">How it works</span>
            </Link>
            <div className="flex items-center gap-8 text-sm">
              <nav className="flex items-center gap-6">
                <Link
                  to="/buyart"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Artworks
                </Link>
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Collections
                </Link>
                <Link
                  to="/"
                  className="flex items-center"
                >
                  <Logo />
                </Link>
                <Link
                  to="/artists"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Artists
                </Link>
                <Link
                  to="/blog"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSearchToggle}
                className={isSearchOpen ? "bg-gray-100" : ""}
              >
                {isSearchOpen ? (
                  <X className="h-5 w-5 cursor-pointer text-gray-600" />
                ) : (
                  <Search className="h-5 w-5 cursor-pointer text-gray-600" />
                )}
              </Button>
              <UserDropdown />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/checkout")}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 cursor-pointer text-gray-600" />
                  {cartCount > 0 && (
                    <span className="-top-2 -right-2 absolute flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Beautiful Search Input Field */}
      {isSearchOpen && (
        <div className="sticky top-[73px] z-40 bg-white border-b shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 py-4 pl-12 pr-6 text-lg placeholder-gray-500 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Popular searches:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Abstract Art")}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Abstract Art
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Contemporary")}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Contemporary
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Sculpture")}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Sculpture
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Photography")}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Photography
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
