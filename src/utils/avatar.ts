/**
 * Generates a placeholder avatar URL using UI Avatars service
 * @param name - The name to use for generating the avatar
 * @param size - The size of the avatar (default: 200)
 * @returns URL string for the placeholder avatar
 */
export function getPlaceholderAvatar(name: string = "User", size: number = 200): string {
  // Clean the name and get initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Use UI Avatars service - simple and reliable
  // Format: https://ui-avatars.com/api/?name=John+Doe&size=200&background=random
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=random&color=fff&bold=true&format=png`;
}

/**
 * Gets the avatar URL with fallback to placeholder
 * @param avatarUrl - The original avatar URL (can be null/undefined/empty)
 * @param name - The name to use for placeholder generation
 * @param size - The size of the avatar (default: 200)
 * @returns URL string for the avatar
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  name: string = "User",
  size: number = 200
): string {
  // If avatarUrl is provided and not empty, use it
  if (avatarUrl && avatarUrl.trim() !== "" && avatarUrl !== "/placeholder.svg" && avatarUrl !== "/default-avatar.png") {
    return avatarUrl;
  }
  
  // Otherwise, use placeholder service
  return getPlaceholderAvatar(name, size);
}








