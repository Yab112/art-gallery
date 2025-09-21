import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages";
import { AppLayout } from "./components/layout/app-layout";
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
