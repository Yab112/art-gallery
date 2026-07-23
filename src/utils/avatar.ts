/**
 * Generates a placeholder avatar as an inline SVG data URI (no network request).
 */
export function getPlaceholderAvatar(name = "User", size = 200): string {
    const initials =
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U"

    const hash = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    const hue = Math.abs(hash % 360)
    const fontSize = Math.round(size * 0.38)

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="hsl(${hue},65%,45%)"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${initials}</text></svg>`

    return `data:image/svg+xml,${encodeURIComponent(svg)}`
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
    name = "User",
    size = 200
): string {
    // If avatarUrl is provided and not empty, use it
    if (
        avatarUrl &&
        avatarUrl.trim() !== "" &&
        avatarUrl !== "/placeholder.svg" &&
        avatarUrl !== "/default-avatar.png"
    ) {
        return avatarUrl
    }

    // Otherwise, use placeholder service
    return getPlaceholderAvatar(name, size)
}
