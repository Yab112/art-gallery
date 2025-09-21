import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header";

export function AppLayout() {
  return (
    <>
      <div className="bg-[#F5f5f5] font-poppins ">
        <ScrollToHash />
        <Header />
        <Outlet />
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
