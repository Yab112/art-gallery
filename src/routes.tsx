import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import LandingPage from "./pages";
import ArtMarketplace from "./pages/ArtMarketplace";
import ArtistDetailPage from "./pages/ArtistPublic";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import NoMatch from "./pages/NoMatch";

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
        {
          path: "artist/:id",
          element: <ArtistDetailPage />,
        },
        {
          path: "buy-art",
          element: <ArtMarketplace />,
        },
        {},
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
