import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import LandingPage from "./pages";
import ArtMarketplace from "./pages/ArtMarketplace";
import ArtistDetailPage from "./pages/ArtistPublic";
import ArtistsPage from "./pages/Artists";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import BlogPage from "./pages/Blog";
import BlogDetailPage from "./pages/BlogDetail";
import BlogSuccessPage from "./pages/BlogSuccess";
import CheckoutPage from "./pages/Checkout";
import CollectionDetailPage from "./pages/CollectionDetail";
import CollectionsPage from "./pages/Collections";
import EditArtworkPage from "./pages/EditArtwork";
import EditProfilePage from "./pages/EditProfile";
import FavoritesPage from "./pages/Favorites";
import FollowFeedPage from "./pages/FollowFeed";
import FollowersPage from "./pages/Followers";
import FollowingPage from "./pages/Following";
import ForgotPasswordPage from "./pages/ForgotPassword";
import HowItWorksPage from "./pages/HowItWorks";
import LoginPage from "./pages/Login";
import MyArtworksPage from "./pages/MyArtworks";
import NoMatch from "./pages/NoMatch";
import OrdersPage from "./pages/Orders";
import PaymentCancelPage from "./pages/PaymentCancel";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import PublicCollectionsPage from "./pages/PublicCollections";
import ResetPasswordPage from "./pages/ResetPassword";
import SettingsPage from "./pages/Settings";
import SignupPage from "./pages/Signup";
import VerifyEmailPage from "./pages/VerifyEmail";
import SellArtPage from "./pages/sellArt";
import ProfilePage from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "artwork/:id",
        element: <ArtworkDetailPage />,
      },
      {
        path: "artwork/:id/edit",
        element: <EditArtworkPage />,
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
        path: "payment/success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "payment/cancel",
        element: <PaymentCancelPage />,
      },
      {
        path: "how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "sellart",
        element: <SellArtPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/:userId",
        element: <ProfilePage />,
      },
      {
        path: "profile/:userId/followers",
        element: <FollowersPage />,
      },
      {
        path: "profile/:userId/following",
        element: <FollowingPage />,
      },
      {
        path: "profile/edit",
        element: <EditProfilePage />,
      },
      {
        path: "feed",
        element: <FollowFeedPage />,
      },
      {
        path: "profile/my-artworks",
        element: <MyArtworksPage />,
      },
      {
        path: "collections",
        element: <PublicCollectionsPage />,
      },
      {
        path: "profile/collections",
        element: <CollectionsPage />,
      },
      {
        path: "collections/:id",
        element: <CollectionDetailPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "blog/:slug",
        element: <BlogDetailPage />,
      },
      {
        path: "blog/success",
        element: <BlogSuccessPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "*",
    element: <NoMatch />,
  },
]);
