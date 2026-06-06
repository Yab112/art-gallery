import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useArtworks } from "@/queries/artworkQueries";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  onClose?: () => void;
}

export function AuthLayout({ children, onClose }: AuthLayoutProps) {
  const navigate = useNavigate();
  const { data } = useArtworks({ limit: 30, isApproved: true });
  const [column1, setColumn1] = useState<any[]>([]);
  const [column2, setColumn2] = useState<any[]>([]);
  const [column3, setColumn3] = useState<any[]>([]);

  // Lock body scroll when auth layout is mounted
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (data?.artworks && data.artworks.length > 0) {
      const shuffled = [...data.artworks].sort(() => 0.5 - Math.random());
      const size = Math.floor(shuffled.length / 3);

      setColumn1([...shuffled.slice(0, size), ...shuffled.slice(0, size)]);
      setColumn2([
        ...shuffled.slice(size, size * 2),
        ...shuffled.slice(size, size * 2),
      ]);
      setColumn3([...shuffled.slice(size * 2), ...shuffled.slice(size * 2)]);
    }
  }, [data]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-[9999] h-svh w-screen overflow-hidden bg-white lg:flex overscroll-none">
      {/* Left side - Wider Artistic Animated Artwork Display (62% width) */}
      <div className="relative hidden h-full w-[62%] flex-col justify-between overflow-hidden bg-[#f3f2ef] lg:flex">
        {/* ... animated gallery content ... */}
        {/* Subtle Canvas Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-[0.04]"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
          }}
        />

        {/* Floating Gradient for Depth */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#f3f2ef] via-transparent to-[#f3f2ef] opacity-80" />

        {/* Infinite Scrolling Columns - Now with 3 columns for the wider space */}
        <div className="absolute inset-0 flex gap-6 px-12 py-6">
          {/* Column 1 - Scrolling Down */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ y: [0, -1000] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-6"
            >
              {column1.map((artwork, i) => (
                <div
                  key={`col1-${artwork.id}-${i}`}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-200 shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  <img
                    src={artwork.photos?.[0]}
                    alt=""
                    className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0 hover:scale-105"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Column 2 - Scrolling Up (Offset) */}
          <div className="flex-1 overflow-hidden pt-32">
            <motion.div
              animate={{ y: [-1000, 0] }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-6"
            >
              {column2.map((artwork, i) => (
                <div
                  key={`col2-${artwork.id}-${i}`}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-200 shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  <img
                    src={artwork.photos?.[0]}
                    alt=""
                    className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0 hover:scale-105"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Column 3 - Scrolling Down (Different Speed) */}
          <div className="flex-1 overflow-hidden pt-12">
            <motion.div
              animate={{ y: [0, -1000] }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-6"
            >
              {column3.map((artwork, i) => (
                <div
                  key={`col3-${artwork.id}-${i}`}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-200 shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  <img
                    src={artwork.photos?.[0]}
                    alt=""
                    className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0 hover:scale-105"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Branding Overlay - Top */}
        <div className="relative z-30 flex h-full flex-col justify-between p-12 pointer-events-none">
          <div className="space-y-2">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="block font-bold text-red-600 text-[10px] uppercase tracking-[0.5em]"
            >
              The Collector's Portal
            </motion.span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              className="h-px bg-red-600"
            />
          </div>

          {/* Branding Overlay - Bottom */}
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-black text-gray-900 text-[11px] uppercase tracking-[0.2em]">
                Artopia Fine Art
              </p>
              <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em]">
                Curated Collective © 2026
              </p>
            </div>
            <div className="font-serif text-6xl text-gray-900/10 select-none tracking-tighter">
              ARTOPIA.
            </div>
          </div>
        </div>
      </div>

      {/* Right side - More compact Auth forms (38% width on desktop) */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-white">
        {/* Mobile Header - Show only on small screens */}
        <div className="flex shrink-0 items-center justify-between p-6 lg:hidden">
          <div className="font-serif text-xl font-bold tracking-tight">
            ARTOPIA.
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Close button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-8 right-8 z-10 hidden rounded-full hover:bg-gray-100 lg:flex"
        >
          <X className="h-5 w-5 text-gray-400" />
        </Button>

        <div className="flex flex-1 items-center justify-center p-6 lg:p-16 overflow-y-auto touch-pan-y overscroll-contain">
          {/* Subtle background element for the form side */}
          <div className="absolute top-0 right-0 -z-10 h-64 w-64 translate-x-32 translate-y--32 rounded-full bg-red-50/30 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[360px]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
