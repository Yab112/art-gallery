import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../footer";
import Header from "../header";

export function AppLayout() {
  return (
    <>
      <div className="font-poppins overflow-x-hidden">
        <ScrollToTop />
        <ScrollToHash />
        <Header />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}

// Scroll to top on route change and page refresh
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant for immediate scroll, or "smooth" for animated
    });
  }, [pathname]);

  // Also scroll to top on initial page load/refresh
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return null;
};

const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to ensure page has scrolled to top first
      setTimeout(() => {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [hash]);

  return null;
};
