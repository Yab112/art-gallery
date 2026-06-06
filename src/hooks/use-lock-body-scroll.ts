import { useEffect } from "react"

/**
 * Locks page scroll while a mobile overlay/sidebar is open.
 * Restores scroll position on close.
 */
export function useLockBodyScroll(locked: boolean, mediaQuery?: string) {
    useEffect(() => {
        if (!locked) return
        if (mediaQuery && !window.matchMedia(mediaQuery).matches) return

        const scrollY = window.scrollY
        const { style: bodyStyle } = document.body
        const { style: htmlStyle } = document.documentElement

        const previous = {
            bodyPosition: bodyStyle.position,
            bodyTop: bodyStyle.top,
            bodyLeft: bodyStyle.left,
            bodyRight: bodyStyle.right,
            bodyWidth: bodyStyle.width,
            bodyOverflow: bodyStyle.overflow,
            htmlOverflow: htmlStyle.overflow,
        }

        bodyStyle.position = "fixed"
        bodyStyle.top = `-${scrollY}px`
        bodyStyle.left = "0"
        bodyStyle.right = "0"
        bodyStyle.width = "100%"
        bodyStyle.overflow = "hidden"
        htmlStyle.overflow = "hidden"

        return () => {
            bodyStyle.position = previous.bodyPosition
            bodyStyle.top = previous.bodyTop
            bodyStyle.left = previous.bodyLeft
            bodyStyle.right = previous.bodyRight
            bodyStyle.width = previous.bodyWidth
            bodyStyle.overflow = previous.bodyOverflow
            htmlStyle.overflow = previous.htmlOverflow
            window.scrollTo(0, scrollY)
        }
    }, [locked, mediaQuery])
}
