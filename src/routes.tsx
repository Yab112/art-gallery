import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import LandingPage from "./pages";
const ArtMarketplace = lazy(() => import("./pages/ArtMarketplace"));
const ArtistDetailPage = lazy(() => import("./pages/ArtistPublic"));
const ArtistsPage = lazy(() => import("./pages/Artists"));
const ArtworkDetailPage = lazy(() => import("./pages/ArtworkDetail"));
const BlogPage = lazy(() => import("./pages/Blog"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetail"));
const BlogSuccessPage = lazy(() => import("./pages/BlogSuccess"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const CollectionDetailPage = lazy(() => import("./pages/CollectionDetail"));
const CollectionsPage = lazy(() => import("./pages/Collections"));
const EditArtworkPage = lazy(() => import("./pages/EditArtwork"));
const EditProfilePage = lazy(() => import("./pages/EditProfile"));
const FavoritesPage = lazy(() => import("./pages/Favorites"));
const FollowFeedPage = lazy(() => import("./pages/FollowFeed"));
const FollowersPage = lazy(() => import("./pages/Followers"));
const FollowingPage = lazy(() => import("./pages/Following"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorks"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallback"));
const LoginPage = lazy(() => import("./pages/Login"));
const MyArtworksPage = lazy(() => import("./pages/MyArtworks"));
const NoMatch = lazy(() => import("./pages/NoMatch"));
const OrdersPage = lazy(() => import("./pages/Orders"));
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancel"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccess"));
const PublicCollectionsPage = lazy(() => import("./pages/PublicCollections"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const SignupPage = lazy(() => import("./pages/Signup"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmail"));
const SellArtPage = lazy(() => import("./pages/sellArt"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const DeliveryConfirmPage = lazy(() => import("./pages/DeliveryConfirm"));
const ConfirmReturnPage = lazy(() => import("./pages/ConfirmReturn"));

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
        path: "delivery-confirm/:orderId",
        element: <DeliveryConfirmPage />,
      },
      {
        path: "confirm-return/:disputeId",
        element: <ConfirmReturnPage />,
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
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "*",
    element: <NoMatch />,
  },
]);
