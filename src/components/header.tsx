import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();
  const textColor = pathname === "/" && "text-white";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 20);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "container absolute inset-x-0 z-[100] mx-auto px-4 py-6 transition-all duration-300"
      )}
    >
      <nav className="flex items-center justify-between">
        <Link to={"/"} className="z-50 flex items-center gap-1">
          <img src="/logo.svg" alt="" className="w-16" />
          <span className={cn("font-medium text-xl", textColor)}>Grow2</span>
        </Link>

        <div className={cn("hidden items-center gap-8 md:flex", textColor)}>
          <Link
            to="/"
            className={cn(
              "font-medium transition-colors hover:text-[#34D399]",
              pathname === "/" && "text-[#34D399]"
            )}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={cn(
              "font-medium transition-colors hover:text-[#34D399]",
              pathname === "/about" && "text-[#34D399]"
            )}
          >
            About Us
          </Link>
          <Link
            to="/product"
            className={cn(
              "font-medium transition-colors hover:text-[#34D399]",
              pathname === "/product" && "text-[#34D399]"
            )}
          >
            Products
          </Link>
        </div>

        <Link
          to="/contact"
          className="hidden items-center gap-2 rounded-full bg-[#34D399] px-6 py-2 font-medium text-white transition-colors hover:bg-[#2ebb85] md:flex"
        >
          Contact Us
          <ArrowUpRight className="h-4 w-4" />
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="z-50 rounded-full bg-[#34D399]/10 p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className={cn("h-6 w-6 transition-colors", textColor)} />
          ) : (
            <Menu className={cn("h-6 w-6 transition-colors", textColor)} />
          )}
        </button>

        {/* Mobile menu overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsMenuOpen(false);
            }
          }}
          aria-label="Close menu overlay"
        />

        {/* Mobile menu panel */}
        <div
          className={cn(
            "fixed top-0 right-0 z-[10000] flex h-full w-[80%] max-w-sm transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mt-16 flex flex-col space-y-2 p-8">
            <Link
              to="/"
              className={cn(
                "font-medium text-xl transition-colors hover:text-[#34D399]",
                pathname === "/" && "text-[#34D399]"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={cn(
                "font-medium text-xl transition-colors hover:text-[#34D399]",
                pathname === "/about" && "text-[#34D399]"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/product"
              className={cn(
                "font-medium text-xl transition-colors hover:text-[#34D399]",
                pathname === "/product" && "text-[#34D399]"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>

            <div className="mt-auto pt-2">
              <Link
                to="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#34D399] px-6 py-3 font-medium text-white transition-colors hover:bg-[#2ebb85]"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
