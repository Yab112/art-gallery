import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global scroll-to-top component that:
 * 1. Scrolls to top on route changes
 * 2. Scrolls to top on page refresh/initial load
 * 3. Works for all routes in the application
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes (route navigation)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  // Scroll to top on initial page load/refresh
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return null;
}

