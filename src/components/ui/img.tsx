import { forwardRef, useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from "react"
import { guessSizes, isOptimizable, optimizedSrcSet, optimizedUrl } from "@/lib/image"

export interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
    /** Shown if the image (and the un-optimised original) fail to load. Pass null to disable. */
    fallbackSrc?: string | null
    /** Upper bound for generated srcset widths. */
    maxWidth?: number
    quality?: number
}

/**
 * Drop-in replacement for <img>:
 * - serves resized AVIF/WebP via the image CDN with a responsive srcset
 * - lazy-loads and decodes off the main thread by default
 * - on failure retries the original URL, then shows a placeholder (never a broken icon)
 *
 * If the caller passes its own onError, it is called instead of showing the
 * placeholder, so components with custom fallbacks keep working.
 */
export const Img = forwardRef<HTMLImageElement, ImgProps>(function Img(
    {
        src,
        srcSet,
        sizes,
        loading,
        decoding,
        fallbackSrc = "/placeholder.svg",
        maxWidth = 2048,
        quality = 75,
        onError,
        className,
        ...rest
    },
    ref,
) {
    // 0 = optimised, 1 = original, 2 = fallback, 3 = give up
    const [stage, setStage] = useState(0)

    useEffect(() => {
        setStage(0)
    }, [src])

    const canOptimize = !srcSet && isOptimizable(src)
    let currentSrc = src
    let currentSrcSet = srcSet
    let currentSizes = sizes

    if (stage === 0 && canOptimize) {
        currentSrc = optimizedUrl(src, Math.min(1080, maxWidth), quality)
        currentSrcSet = optimizedSrcSet(src, maxWidth, quality)
        currentSizes = sizes ?? guessSizes(className)
    } else if (stage >= 2 && fallbackSrc) {
        currentSrc = fallbackSrc
        currentSrcSet = undefined
    }

    const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        if (stage === 0 && canOptimize) {
            setStage(1)
            return
        }
        if (onError) {
            onError(event)
            return
        }
        if (stage < 2 && fallbackSrc && src !== fallbackSrc) {
            setStage(2)
            return
        }
        setStage(3)
    }

    return (
        <img
            ref={ref}
            src={currentSrc || (fallbackSrc ?? undefined)}
            srcSet={currentSrcSet}
            sizes={currentSrcSet ? currentSizes : undefined}
            loading={loading ?? "lazy"}
            decoding={decoding ?? "async"}
            onError={handleError}
            className={className}
            {...rest}
        />
    )
})
