# Routes Documentation

## Public Routes (No Authentication Required)

These routes are accessible to everyone, including logged-out users:

1. **`/`** - Landing Page
2. **`/buyart`** - Art Marketplace (Browse artworks)
3. **`/artwork/:name`** - Artwork Detail Page
4. **`/artist/:id`** - Artist Public Profile
5. **`/artists`** - Artists Listing Page
6. **`/how-it-works`** - How It Works Page
7. **`/login`** - Login Page
8. **`/signup`** - Signup Page
9. **`/forgot-password`** - Forgot Password Page

## Protected Routes (Authentication Required)

These routes require the user to be logged in. If not authenticated, users will be redirected to `/login`:

1. **`/profile`** - User Profile Page ✅ Protected
2. **`/profile/edit`** - Edit Profile Page ✅ Protected
3. **`/favorites`** - User's Favorites ✅ Protected
4. **`/orders`** - User's Orders ✅ Protected
5. **`/settings`** - User Settings ✅ Protected
6. **`/checkout`** - Checkout Page ✅ Protected
7. **`/sellart`** - Sell Artwork Page ✅ Protected

## Route Protection Implementation

Routes are protected using the `ProtectedRoute` component which:
- Checks if user is authenticated using `useAuth()` hook
- Shows loading spinner while checking authentication
- Redirects to `/login?redirect=<current-path>` if not authenticated
- Allows access if authenticated

## Notes

- Login and Signup pages redirect to home if already authenticated
- Protected routes preserve the intended destination in the redirect query parameter
- After successful login, users are redirected back to their original destination

