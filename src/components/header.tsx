import { Search, ShoppingCart, X, Menu, User, LogOut, Settings, Heart, ShoppingBag, LogIn, UserPlus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { UserDropdown } from "./user-dropdown";
import { useState, useRef, useEffect } from "react";
import { useCartSummary } from "@/queries/cartQueries";
import { useNavigate } from "react-router-dom";
import { MegaMenu } from "./mega-menu";
import { useAuth } from "@/hooks/use-auth";
import { SigninForm } from "./auth/signin-form";
import { SignupForm } from "./auth/signup-form";
import { AuthLayout } from "./auth/auth-layout";
import { useDebounce } from "@/hooks/use-debounce";
import { useArtworks } from "@/queries/artworkQueries";
import { useCollections } from "@/queries/collectionQueries";
import { useGetAllArtists } from "@/services/artist/useGetAllArtists";

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

function MobileUserMenu({ onItemClick }: { onItemClick: () => void }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  const handleLogout = async () => {
    try {
      await logout();
      onItemClick();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (showAuth) {
    return (
      <AuthLayout onClose={() => setShowAuth(false)}>
        {authView === "signin" ? (
          <SigninForm
            onSwitchToSignup={() => setAuthView("signup")}
            onForgotPassword={() => {
              setShowAuth(false);
              navigate("/forgot-password", { replace: true });
            }}
          />
        ) : (
          <SignupForm onSwitchToSignin={() => setAuthView("signin")} />
        )}
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="space-y-2">
        {/* User Info */}
        <div className="flex items-center space-x-3 pb-2 border-b">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-red-700" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user.email || ""}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <button
          className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => {
            navigate("/profile");
            onItemClick();
          }}
        >
          <User className="h-4 w-4 mr-3 text-gray-500" />
          Profile
        </button>
        <button
          className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => {
            navigate("/favorites");
            onItemClick();
          }}
        >
          <Heart className="h-4 w-4 mr-3 text-gray-500" />
          Favorites
        </button>
        <button
          className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => {
            navigate("/orders");
            onItemClick();
          }}
        >
          <ShoppingBag className="h-4 w-4 mr-3 text-gray-500" />
          My Orders
        </button>
        <button
          className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => {
            navigate("/settings");
            onItemClick();
          }}
        >
          <Settings className="h-4 w-4 mr-3 text-gray-500" />
          Settings
        </button>
        <button
          className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors mt-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-2 pb-2 border-b">
        <p className="text-sm text-gray-600">Welcome to Artopia</p>
      </div>
      <button
        className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
        onClick={() => {
          setAuthView("signin");
          setShowAuth(true);
        }}
      >
        <LogIn className="h-4 w-4 mr-3 text-gray-500" />
        Sign In
      </button>
      <button
        className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
        onClick={() => {
          setAuthView("signup");
          setShowAuth(true);
        }}
      >
        <UserPlus className="h-4 w-4 mr-3 text-gray-500" />
        Create Account
      </button>
      <button
        className="flex items-center w-full px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors"
        onClick={() => {
          onItemClick();
          navigate("/buyart");
        }}
      >
        Explore as guest
      </button>
    </div>
  );
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch cart summary only when logged in (guests: hide cart, skip API)
  const { data: cartSummary } = useCartSummary({ enabled: !!user });
  const cartCount = cartSummary?.itemCount || 0;

  // Search functionality
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: artworksData, isLoading: isLoadingArtworks } = useArtworks(
    { search: debouncedSearchQuery, limit: 5 },
    { enabled: debouncedSearchQuery.length >= 2 }
  );

  const { data: collectionsData, isLoading: isLoadingCollections } = useCollections(
    1,
    5,
    "public",
    debouncedSearchQuery,
    { enabled: debouncedSearchQuery.length >= 2 }
  );

  const { data: artistsData, isLoading: isLoadingArtists } = useGetAllArtists(
    1,
    5,
    debouncedSearchQuery,
    undefined,
    undefined,
    undefined,
    { enabled: debouncedSearchQuery.length >= 2 }
  );

  const isSearching = isLoadingArtworks || isLoadingCollections || isLoadingArtists;
  const hasResults =
    (artworksData?.artworks?.length || 0) > 0 ||
    (collectionsData?.collections?.length || 0) > 0 ||
    (artistsData?.artists?.length || 0) > 0;

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };
  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    } else {
      // Close mobile menu when opening search
      setIsMobileMenuOpen(false);
    }
  };

  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = searchDropdownRef.current?.contains(target);
      const isInsideButton = searchButtonRef.current?.contains(target);

      if (!isInsideDropdown && !isInsideButton) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        <div className="mx-auto max-w-7xl px-4 py-4 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            {/* Mobile Menu Button - visible on mobile only */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>

            {/* How it works link - hidden on mobile */}
            <Link
              to="/how-it-works"
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>💡</span>
              <span className="text-sm">How it works</span>
            </Link>

            {/* Logo - centered on mobile, part of nav on desktop */}
            <Link to="/" className="flex items-center md:hidden">
              <Logo />
            </Link>

            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <nav className="flex items-center gap-6">
                <MegaMenu type="artwork" label="Artworks" />
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Collections
                </Link>
                <Link to="/" className="flex items-center">
                  <Logo />
                </Link>
                <MegaMenu type="artist" label="Artists" />
                {user && (
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Orders
                  </Link>
                )}
                <Link
                  to="/blog"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </nav>
            </div>

            {/* Action buttons - always visible */}
            <div className="flex items-center gap-2" ref={searchButtonRef}>
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
              <div className="hidden sm:block">
                <UserDropdown />
              </div>
              {user && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleMobileMenuToggle}
          />
          {/* Mobile Menu Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" className="flex items-center" onClick={handleMobileMenuToggle}>
                  <Logo />
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleMobileMenuToggle}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                <Link
                  to="/how-it-works"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={handleMobileMenuToggle}
                >
                  <span>💡</span>
                  <span>How it works</span>
                </Link>
                <div className="border-t pt-4">
                  <MegaMenu
                    type="artwork"
                    label="Artworks"
                    mobileMode={true}
                    onItemClick={handleMobileMenuToggle}
                  />
                </div>
                <Link
                  to="/collections"
                  className="block text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={handleMobileMenuToggle}
                >
                  Collections
                </Link>
                <div className="border-t pt-4">
                  <MegaMenu
                    type="artist"
                    label="Artists"
                    mobileMode={true}
                    onItemClick={handleMobileMenuToggle}
                  />
                </div>
                <Link
                  to="/blog"
                  className="block text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={handleMobileMenuToggle}
                >
                  Blog
                </Link>
              </nav>

              {/* Mobile Menu Footer - User Profile Section */}
              <div className="p-4 border-t space-y-2">
                <MobileUserMenu onItemClick={handleMobileMenuToggle} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Beautiful Search Input Field */}
      {isSearchOpen && (
        <div
          ref={searchDropdownRef}
          className="sticky top-[73px] z-40 bg-white border-b shadow-lg animate-in slide-in-from-top-2 duration-300"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 py-3 md:py-4 pl-10 md:pl-12 pr-6 text-base md:text-lg placeholder-gray-500 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                <span className="text-xs md:text-sm text-gray-500 w-full md:w-auto">Popular searches:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Abstract Art")}
                  className="rounded-full bg-gray-100 px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Abstract Art
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Contemporary")}
                  className="rounded-full bg-gray-100 px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Contemporary
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Sculpture")}
                  className="rounded-full bg-gray-100 px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Sculpture
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Photography")}
                  className="rounded-full bg-gray-100 px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Photography
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {debouncedSearchQuery.length >= 2 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-4 max-h-[60vh] overflow-y-auto">
                {/* Artworks column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    Artworks
                    {isLoadingArtworks && <Loader2 className="h-3 w-3 animate-spin" />}
                  </h3>
                  <div className="space-y-2">
                    {artworksData?.artworks?.map((artwork) => (
                      <button
                        key={artwork.id}
                        onClick={() => handleResultClick(`/artwork/${artwork.id}`)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                      >
                        <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                          {artwork.photos?.[0] ? (
                            <img src={artwork.photos[0]} alt={artwork.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">🎨</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                          <p className="text-xs text-gray-500 font-mono">${artwork.desiredPrice}</p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingArtworks && artworksData?.artworks?.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No artworks found</p>
                    )}
                  </div>
                </div>

                {/* Artists column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    Artists
                    {isLoadingArtists && <Loader2 className="h-3 w-3 animate-spin" />}
                  </h3>
                  <div className="space-y-2">
                    {artistsData?.artists?.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleResultClick(`/artist/${artist.id}`)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                      >
                        <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          {artist.avatar ? (
                            <img src={artist.avatar} alt={artist.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">👨‍🎨</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{artist.name}</p>
                          <p className="text-xs text-gray-500">{artist.country || 'Global Artist'}</p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingArtists && artistsData?.artists?.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No artists found</p>
                    )}
                  </div>
                </div>

                {/* Collections column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    Collections
                    {isLoadingCollections && <Loader2 className="h-3 w-3 animate-spin" />}
                  </h3>
                  <div className="space-y-2">
                    {collectionsData?.collections?.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => handleResultClick(`/collections/${collection.id}`)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                      >
                        <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                          {collection.coverImage ? (
                            <img src={collection.coverImage} alt={collection.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">🖼️</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{collection.name}</p>
                          <p className="text-xs text-gray-500">{collection.artworkCount || 0} items</p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingCollections && collectionsData?.collections?.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No collections found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {debouncedSearchQuery.length >= 2 && !isSearching && !hasResults && (
              <div className="mt-8 text-center py-8">
                <p className="text-gray-500">No results found for "{debouncedSearchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
