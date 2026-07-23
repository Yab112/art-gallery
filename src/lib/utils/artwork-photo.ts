export function normalizeArtworkPhotos(photos: unknown): string[] {
    if (Array.isArray(photos)) {
        return photos.filter(
            (photo): photo is string =>
                typeof photo === "string" && photo.trim() !== "",
        )
    }

    if (typeof photos === "string" && photos.trim() !== "") {
        return [photos.trim()]
    }

    return []
}

export function isValidArtworkPhotoUrl(url: string): boolean {
    const trimmed = url.trim()
    if (!trimmed) return false
    if (trimmed.includes("mock-s3-bucket")) return false
    return trimmed.startsWith("http") || trimmed.startsWith("data:")
}

export function getArtworkPhotoUrl(photos: unknown): string {
    return (
        normalizeArtworkPhotos(photos).find(isValidArtworkPhotoUrl) ?? ""
    )
}
