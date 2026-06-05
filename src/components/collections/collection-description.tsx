import { useMemo, useState } from "react"

/** Matches the preview length from collection detail bios */
export const COLLECTION_DESCRIPTION_PREVIEW_CHARS = 1413

function truncateAtWord(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text

    let cut = text.slice(0, maxChars).trimEnd()
    const lastSpace = cut.lastIndexOf(" ")
    if (lastSpace > maxChars * 0.8) {
        cut = cut.slice(0, lastSpace)
    }
    return cut
}

interface CollectionDescriptionProps {
    text: string
    previewChars?: number
    className?: string
}

export function CollectionDescription({
    text,
    previewChars = COLLECTION_DESCRIPTION_PREVIEW_CHARS,
    className = "whitespace-normal break-words text-gray-700 text-sm leading-relaxed"
}: CollectionDescriptionProps) {
    const [expanded, setExpanded] = useState(false)

    const needsTruncation = text.length > previewChars
    const preview = useMemo(
        () => (needsTruncation ? truncateAtWord(text, previewChars) : text),
        [text, previewChars, needsTruncation]
    )

    if (!needsTruncation) {
        return <p className={className}>{text}</p>
    }

    return (
        <div>
            <p className={className}>
                {expanded ? text : preview}
                {!expanded && <span className="text-gray-600"> ...</span>}
            </p>
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 font-medium text-red-700 text-sm hover:text-red-800 hover:underline"
                aria-expanded={expanded}
            >
                {expanded ? "Read less" : "Read more"}
            </button>
        </div>
    )
}
