import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../footer";
import Header from "../header";

export function AppLayout() {
  return (
    <>
      <div className="font-poppins overflow-x-hidden">
        <ScrollToHash />
        <Header />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}

const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return null;
};
