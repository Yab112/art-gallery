// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  role: string;
  score: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  // Account Management
  emailSubscription?: boolean; // Subscribe to blog post notifications
  firstlogin?: boolean; // First login flag
  banReason?: string | null; // Reason for ban
  banExpires?: string | null; // Ban expiration date
  // Analytics & Engagement
  lastActiveAt?: string | null;
  profileViews?: number;
  heatScore?: number;
  // Earnings
  earning?: number;
  // Preferences & Settings
  themePreference?: string; // UI theme: light|dark
  languagePreference?: string; // Content language
  timezone?: string | null; // User timezone
  messagingPreferences?: Record<string, any> | null; // Message settings JSON
  // Talent Types
  talentTypes?: Array<{
    talentType: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      icon?: string | null;
    };
  }>;
}

export interface UserProfile extends User {
  artworkCount?: number;
  reviewCount?: number;
  collectionCount?: number;
  artworks?: any[];
  reviews?: any[];
}

// User Preferences Interface
export interface UserPreferences {
  themePreference: string; // light | dark
  languagePreference: string; // en | es | fr | etc.
  timezone: string; // UTC | America/New_York | etc.
  messagingPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    messagePrivacy?: 'public' | 'friends' | 'private';
    [key: string]: any;
  };
}

// Extended User Profile for authenticated users (includes all fields)
export interface AuthenticatedUserProfile extends UserProfile {
  email: string; // Always included for own profile
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  firstlogin?: boolean;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  preferences?: UserPreferences;
}

