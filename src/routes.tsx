import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages";
import { AppLayout } from "./components/layout/app-layout";
import NoMatch from "./pages/NoMatch";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import ArtistDetailPage from "./pages/artistpuplic";
import ArtMarketplace from "./pages/ArtMarketplace";
import { ArtistsPage } from "./components/artist/artists-page";
import CheckoutPage from "./pages/Checkout";
import HowItWorksPage from "./pages/HowItWorks";

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
          element: <ArtMarketplace />,
        },
        {
          path: "artists",
          element: <ArtistsPage />,
        },
        {
          path: "checkout",
          element: <CheckoutPage />,
        },
        {
          path: "how-it-works",
          element: <HowItWorksPage />,
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
