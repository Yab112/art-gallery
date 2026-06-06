import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useArtworks } from "@/queries/artworkQueries";
import { useCartSummary } from "@/queries/cartQueries";
import { useCollections } from "@/queries/collectionQueries";
import { useGetAllArtists } from "@/services/artist/useGetAllArtists";
import { usePlatformSettings } from "@/queries/settingsQueries";
import { cn } from "@/lib/utils";
import {
  Heart,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MegaMenu } from "./mega-menu";
import { Button } from "./ui/button";
import { UserDropdown } from "./user-dropdown";
import { motion, AnimatePresence } from "framer-motion";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

function Logo() {
  const [imageError, setImageError] = useState(false);
  const { data: platformSettings } = usePlatformSettings();
  const siteName = platformSettings?.settings?.siteName;

  if (imageError) {
    return (
      <span className="block font-bold text-2xl text-red-600 md:text-4xl tracking-tighter">
        {siteName?.toLowerCase()}
      </span>
    );
  }

  return (
    <img
      src="/mainlogo.png"
      alt="Logo"
      className="h-6 w-auto md:h-8"
      onError={() => setImageError(true)}
    />
  );
}

function MobileUserMenu({ onItemClick }: { onItemClick: () => void }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { data: platformSettings } = usePlatformSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onItemClick();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="space-y-6 pt-6">
        {/* User Info */}
        <div className="flex items-center space-x-4 px-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-12 w-12 rounded-full border border-gray-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <User className="h-6 w-6 text-red-600" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-serif text-lg text-gray-900 leading-tight">
              {user.name || "Collector"}
            </p>
            <p className="truncate text-gray-400 text-xs tracking-wide uppercase">
              {user.role || "Member"}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-2 gap-3 px-2">
          <button
            className="flex flex-col items-start gap-3 rounded-xl bg-gray-50 p-4 transition-all hover:bg-gray-100"
            onClick={() => {
              navigate("/profile");
              onItemClick();
            }}
          >
            <User className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">Profile</span>
          </button>
          <button
            className="flex flex-col items-start gap-3 rounded-xl bg-gray-50 p-4 transition-all hover:bg-gray-100"
            onClick={() => {
              navigate("/favorites");
              onItemClick();
            }}
          >
            <Heart className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">Favorites</span>
          </button>
          <button
            className="flex flex-col items-start gap-3 rounded-xl bg-gray-50 p-4 transition-all hover:bg-gray-100"
            onClick={() => {
              navigate("/orders");
              onItemClick();
            }}
          >
            <ShoppingBag className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">Orders</span>
          </button>
          <button
            className="flex flex-col items-start gap-3 rounded-xl bg-gray-50 p-4 transition-all hover:bg-gray-100"
            onClick={() => {
              navigate("/settings");
              onItemClick();
            }}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">Settings</span>
          </button>
        </div>

        <button
          className="flex w-full items-center justify-between rounded-xl border border-red-100 px-6 py-4 text-red-600 transition-all hover:bg-red-50"
          onClick={handleLogout}
        >
          <span className="font-bold text-xs uppercase tracking-widest">
            Logout
          </span>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="space-y-3 px-2">
        <p className="font-serif text-2xl text-gray-900 leading-tight">
          Welcome to <br />
          <span className="text-red-600">
            {platformSettings?.settings?.siteName || "Artopia"}
          </span>
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Sign in to access your curated collection and favorite artists.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-2">
        <Button
          className="h-14 w-full rounded-xl bg-gray-900 font-bold text-white tracking-widest uppercase text-xs shadow-lg shadow-gray-200"
          onClick={() => {
            onItemClick();
            navigate("/login");
          }}
        >
          Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-14 w-full rounded-xl border-2 border-gray-100 font-bold text-gray-900 tracking-widest uppercase text-xs"
          onClick={() => {
            onItemClick();
            navigate("/signup");
          }}
        >
          Create Account
        </Button>
      </div>

      <button
        className="w-full py-2 text-center text-gray-400 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-gray-600"
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

  useLockBodyScroll(isMobileMenuOpen, "(max-width: 767px)");

  // Fetch cart summary only when logged in (guests: hide cart, skip API)
  const { data: cartSummary } = useCartSummary({ enabled: !!user });
  const cartCount = cartSummary?.itemCount || 0;

  // Search functionality
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: artworksData, isLoading: isLoadingArtworks } = useArtworks(
    { search: debouncedSearchQuery, limit: 5 },
    { enabled: debouncedSearchQuery.length >= 2 },
  );

  const { data: collectionsData, isLoading: isLoadingCollections } =
    useCollections(1, 5, "public", debouncedSearchQuery, {
      enabled: debouncedSearchQuery.length >= 2,
    });

  const { data: artistsData, isLoading: isLoadingArtists } = useGetAllArtists(
    1,
    5,
    debouncedSearchQuery,
    undefined,
    undefined,
    undefined,
    { enabled: debouncedSearchQuery.length >= 2 },
  );

  const isSearching =
    isLoadingArtworks || isLoadingCollections || isLoadingArtists;
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
        <div className="mx-auto max-w-7xl overflow-visible px-4 py-4">
          <div className="flex items-center justify-between overflow-visible">
            {/* Mobile Menu Button - visible on mobile only */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-6.5 w-6.5 text-gray-600" />
            </Button>

            {/* How it works link - hidden on mobile */}
            <Link
              to="/how-it-works"
              className="hidden items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 md:flex"
            >
              <span>💡</span>
              <span className="text-sm">How it works</span>
            </Link>

            {/* Logo - centered on mobile, part of nav on desktop */}
            <Link to="/" className="flex items-center md:hidden">
              <Logo />
            </Link>

            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden items-center gap-8 text-sm md:flex">
              <nav className="flex items-center gap-6">
                <MegaMenu type="artwork" label="Artworks" />
                <Link
                  to="/collections"
                  className="text-gray-700 transition-colors hover:text-gray-900"
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
                    className="text-gray-700 transition-colors hover:text-gray-900"
                  >
                    Orders
                  </Link>
                )}
                <Link
                  to="/blog"
                  className="text-gray-700 transition-colors hover:text-gray-900"
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-xl"
              onClick={handleMobileMenuToggle}
            />

            {/* Content Overlay */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
            >
              {/* Artistic Header */}
              <div className="flex items-center justify-between p-8">
                <Logo />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleMobileMenuToggle}
                  className="rounded-full bg-gray-50 transition-transform hover:rotate-90"
                >
                  <X className="h-5 w-5 text-gray-900" />
                </Button>
              </div>

              {/* Navigation Grid */}
              <div className="flex-1 overflow-y-auto px-8 pb-12">
                <nav className="flex flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/how-it-works"
                      className="group flex items-center justify-between py-6 border-b border-gray-50"
                      onClick={handleMobileMenuToggle}
                    >
                      <div className="space-y-1">
                        <span className="block font-serif text-2xl text-gray-900 group-hover:text-red-600 transition-colors">
                          How it works
                        </span>
                        <span className="text-gray-400 text-xs tracking-widest uppercase">
                          The Collector's Guide
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="py-4 border-b border-gray-50">
                      <MegaMenu
                        type="artwork"
                        label="Artworks"
                        mobileMode={true}
                        onItemClick={handleMobileMenuToggle}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/collections"
                      className="group flex items-center justify-between py-6 border-b border-gray-50"
                      onClick={handleMobileMenuToggle}
                    >
                      <div className="space-y-1">
                        <span className="block font-serif text-2xl text-gray-900 group-hover:text-red-600 transition-colors">
                          Collections
                        </span>
                        <span className="text-gray-400 text-xs tracking-widest uppercase">
                          Curated Series
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="py-4 border-b border-gray-50">
                      <MegaMenu
                        type="artist"
                        label="Artists"
                        mobileMode={true}
                        onItemClick={handleMobileMenuToggle}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      to="/blog"
                      className="group flex items-center justify-between py-6 border-b border-gray-50"
                      onClick={handleMobileMenuToggle}
                    >
                      <div className="space-y-1">
                        <span className="block font-serif text-2xl text-gray-900 group-hover:text-red-600 transition-colors">
                          Blog
                        </span>
                        <span className="text-gray-400 text-xs tracking-widest uppercase">
                          Art & Culture
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </nav>

                {/* Mobile User Profile Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <MobileUserMenu onItemClick={handleMobileMenuToggle} />
                </motion.div>
              </div>

              {/* Menu Background Artistic Element */}
              <div className="absolute bottom-0 right-0 -z-10 p-4 opacity-5 pointer-events-none select-none">
                <span className="font-serif text-[12rem] leading-none tracking-tighter">
                  A.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Beautiful Search Input Field */}
      {isSearchOpen && (
        <div
          ref={searchDropdownRef}
          className="slide-in-from-top-2 sticky top-[73px] z-40 animate-in border-b bg-white shadow-lg duration-300"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400 md:left-4 md:h-5 md:w-5" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 py-3 pr-6 pl-10 text-base placeholder-gray-500 transition-all duration-200 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 md:py-4 md:pl-12 md:text-lg"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600 md:right-4"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                <span className="w-full text-gray-500 text-xs md:w-auto md:text-sm">
                  Popular searches:
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Abstract Art")}
                  className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200 md:px-3 md:text-sm"
                >
                  Abstract Art
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Contemporary")}
                  className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200 md:px-3 md:text-sm"
                >
                  Contemporary
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Sculpture")}
                  className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200 md:px-3 md:text-sm"
                >
                  Sculpture
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Photography")}
                  className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200 md:px-3 md:text-sm"
                >
                  Photography
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {debouncedSearchQuery.length >= 2 && (
              <div className="mt-8 grid max-h-[60vh] grid-cols-1 gap-8 overflow-y-auto pb-4 md:grid-cols-3">
                {/* Artworks column */}
                <div className="space-y-4">
                  <h3 className="flex items-center justify-between font-semibold text-gray-400 text-sm uppercase tracking-wider">
                    Artworks
                    {isLoadingArtworks && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </h3>
                  <div className="space-y-2">
                    {artworksData?.artworks?.map((artwork) => (
                      <button
                        key={artwork.id}
                        onClick={() =>
                          handleResultClick(`/artwork/${artwork.id}`)
                        }
                        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {artwork.photos?.[0] ? (
                            <img
                              src={artwork.photos[0]}
                              alt={artwork.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              🎨
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 text-sm">
                            {artwork.title}
                          </p>
                          <p className="font-mono text-gray-500 text-xs">
                            ${artwork.desiredPrice}
                          </p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingArtworks &&
                      artworksData?.artworks?.length === 0 && (
                        <p className="text-gray-400 text-sm italic">
                          No artworks found
                        </p>
                      )}
                  </div>
                </div>

                {/* Artists column */}
                <div className="space-y-4">
                  <h3 className="flex items-center justify-between font-semibold text-gray-400 text-sm uppercase tracking-wider">
                    Artists
                    {isLoadingArtists && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </h3>
                  <div className="space-y-2">
                    {artistsData?.artists?.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() =>
                          handleResultClick(`/artist/${artist.id}`)
                        }
                        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                          {artist.avatar ? (
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              👨‍🎨
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 text-sm">
                            {artist.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {artist.country || "Global Artist"}
                          </p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingArtists &&
                      artistsData?.artists?.length === 0 && (
                        <p className="text-gray-400 text-sm italic">
                          No artists found
                        </p>
                      )}
                  </div>
                </div>

                {/* Collections column */}
                <div className="space-y-4">
                  <h3 className="flex items-center justify-between font-semibold text-gray-400 text-sm uppercase tracking-wider">
                    Collections
                    {isLoadingCollections && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </h3>
                  <div className="space-y-2">
                    {collectionsData?.collections?.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() =>
                          handleResultClick(`/collections/${collection.id}`)
                        }
                        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-sm">
                          {collection.coverImage ? (
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              🖼️
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 text-sm">
                            {collection.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {collection.artworkCount || 0} items
                          </p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingCollections &&
                      collectionsData?.collections?.length === 0 && (
                        <p className="text-gray-400 text-sm italic">
                          No collections found
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            {debouncedSearchQuery.length >= 2 &&
              !isSearching &&
              !hasResults && (
                <div className="mt-8 py-8 text-center">
                  <p className="text-gray-500">
                    No results found for "{debouncedSearchQuery}"
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
}
