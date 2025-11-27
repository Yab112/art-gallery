import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import LandingPage from "./pages";
import ArtMarketplace from "./pages/ArtMarketplace";
import ArtistDetailPage from "./pages/ArtistPublic";
import ArtworkDetailPage from "./pages/ArtworkDetail";
import ArtistsPage from "./pages/Artists";
import CheckoutPage from "./pages/Checkout";
import HowItWorksPage from "./pages/HowItWorks";
import NoMatch from "./pages/NoMatch";
import SellArtPage from "./pages/sellArt";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmailPage from "./pages/VerifyEmail";
import ProfilePage from "./pages/Profile";
import EditProfilePage from "./pages/EditProfile";
import MyArtworksPage from "./pages/MyArtworks";
import EditArtworkPage from "./pages/EditArtwork";
import CollectionDetailPage from "./pages/CollectionDetail";
import CollectionsPage from "./pages/Collections";
import PublicCollectionsPage from "./pages/PublicCollections";
import FavoritesPage from "./pages/Favorites";
import OrdersPage from "./pages/Orders";
import SettingsPage from "./pages/Settings";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import PaymentCancelPage from "./pages/PaymentCancel";
import BlogPage from "./pages/Blog";
import BlogDetailPage from "./pages/BlogDetail";
import MyBlogsPage from "./pages/MyBlogs";
import BlogSuccessPage from "./pages/BlogSuccess";
import EditBlogPage from "./pages/EditBlog";

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
        path: "profile/edit",
        element: <EditProfilePage />,
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
        path: "blog/:slug/edit",
        element: <EditBlogPage />,
      },
      {
        path: "blog/my-blogs",
        element: <MyBlogsPage />,
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
