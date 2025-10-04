import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import LandingPage from "./pages";
import ArtMarketplace from "./pages/ArtMarketplace";
import ArtistDetailPage from "./pages/ArtistPublic";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import { ArtistsPage } from "./components/artist/artists-page";
import CheckoutPage from "./pages/Checkout";
import HowItWorksPage from "./pages/HowItWorks";
import NoMatch from "./pages/NoMatch";
import SellArtPage from "./pages/sellArt";

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
        {
          path: "sellart",
          element: <SellArtPage />,
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
