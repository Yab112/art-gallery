import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages";
import { AppLayout } from "./components/layout/app-layout";
import NoMatch from "./pages/NoMatch";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import ArtistDetailPage from "./pages/artistpuplic";
import ArtMarketplace from "./pages/ArtMarketplace";

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
          path: "buyart",
          element: <ArtMarketplace/>,
        },
        {
        }
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
