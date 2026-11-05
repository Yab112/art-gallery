/**
 * Image optimisation helpers.
 *
 * In production builds on Vercel, raster images are routed through Vercel's
 * image CDN (`/_vercel/image`), which resizes them to the requested width,
 * re-encodes to AVIF/WebP and caches the result at the edge. Artwork uploads
 * are multi-MB PNGs stored in eu-north-1, so this is the single biggest
 * speed-up for gallery pages.
 *
 * Allowed widths and remote hosts must match `images` in vercel.json.
 * Set VITE_IMAGE_CDN=none to disable (e.g. when not hosting on Vercel).
 */

export const IMAGE_WIDTHS = [64, 128, 256, 384, 640, 828, 1080, 1600, 2048] as const

const REMOTE_HOSTS = new Set([
    "amzn-artwork-storage.s3.eu-north-1.amazonaws.com",
    "hebbkx1anhila5yf.public.blob.vercel-storage.com",
])

const RASTER_EXT = /\.(jpe?g|png|webp|avif|gif)$/i

const enabled =
    import.meta.env.PROD && (import.meta.env.VITE_IMAGE_CDN ?? "vercel") !== "none"

export function isOptimizable(src: string | undefined | null): src is string {
    if (!enabled || !src) return false
    if (src.startsWith("/") && !src.startsWith("//")) {
        return RASTER_EXT.test(src.split("?")[0])
    }
    try {
        const url = new URL(src)
        return url.protocol === "https:" && REMOTE_HOSTS.has(url.hostname)
    } catch {
        return false
    }
}

/** Strip query strings from S3 URLs (old presigned links) so the CDN cache key is stable. */
function normalise(src: string): string {
    if (src.startsWith("/")) return src
    try {
        const url = new URL(src)
        if (url.hostname.endsWith(".amazonaws.com")) {
            url.search = ""
        }
        return url.toString()
    } catch {
        return src
    }
}

export function optimizedUrl(src: string, width: number, quality = 75): string {
    const w = IMAGE_WIDTHS.find((size) => size >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]
    return `/_vercel/image?url=${encodeURIComponent(normalise(src))}&w=${w}&q=${quality}`
}

export function optimizedSrcSet(src: string, maxWidth = 2048, quality = 75): string {
    return IMAGE_WIDTHS.filter((w) => w <= maxWidth)
        .map((w) => `${optimizedUrl(src, w, quality)} ${w}w`)
        .join(", ")
}

const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"

/**
 * Guess a `sizes` value from Tailwind width/height classes so small avatars and
 * icons don't download large variants. Falls back to a grid-friendly default.
 */
export function guessSizes(className?: string): string {
    if (!className) return DEFAULT_SIZES
    let max = 0
    for (const match of className.matchAll(/(?:^|\s)(?:[a-z]+:)?(?:w|h|size)-(\d+(?:\.5)?)(?=\s|$)/g)) {
        max = Math.max(max, Number(match[1]))
    }
    if (max > 0 && max <= 32) {
        return `${Math.ceil(max * 4)}px`
    }
    return DEFAULT_SIZES
}
