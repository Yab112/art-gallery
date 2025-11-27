import { z } from "zod";

/**
 * Zod validation schema for profile form data
 * Matches backend validation rules from PROFILE_VALIDATION constants
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be shorter than or equal to 100 characters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  
  bio: z
    .string()
    .max(500, "Bio must be shorter than or equal to 500 characters")
    .optional()
    .or(z.literal("")),
  
  location: z
    .string()
    .max(100, "Location must be shorter than or equal to 100 characters")
    .optional()
    .or(z.literal("")),
  
  website: z
    .union([
      z.string().url("Please enter a valid URL (e.g., https://example.com)").max(200, "Website must be shorter than or equal to 200 characters"),
      z.literal(""),
    ])
    .optional(),
  
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  
  avatar: z
    .string()
    .optional(),
  
  coverImage: z
    .string()
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

