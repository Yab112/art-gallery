import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages";
import { AppLayout } from "./components/layout/app-layout";
import NoMatch from "./pages/NoMatch";
import ArtworkDetailPage from "./pages/ArtworkDetail";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          path: "",
          element: <LandingPage />,
        },
        {
          path: "artwork/:name",
          element: <ArtworkDetailPage />,
        },
      ],
    },

    {
      path: "*",
      element: <NoMatch />,
    },
  ],
  {
    basename: global.basename,
  }
);
