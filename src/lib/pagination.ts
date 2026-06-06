/**
 * Returns the sliding window of page numbers to display (blog-style pagination).
 */
export function getVisiblePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible = 5
): number[] {
    if (totalPages <= 0) return []

    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    if (currentPage <= 3) {
        return Array.from({ length: maxVisible }, (_, index) => index + 1)
    }

    if (currentPage >= totalPages - 2) {
        return Array.from({ length: maxVisible }, (_, index) => totalPages - maxVisible + index + 1)
    }

    return Array.from({ length: maxVisible }, (_, index) => currentPage - 2 + index)
}

export function shouldShowLeadingPageJump(currentPage: number, totalPages: number): boolean {
    return totalPages > 5 && currentPage > 3
}

export function shouldShowLeadingEllipsis(currentPage: number, totalPages: number): boolean {
    return totalPages > 5 && currentPage > 4
}

export function shouldShowTrailingPageJump(currentPage: number, totalPages: number): boolean {
    return totalPages > 5 && currentPage < totalPages - 2
}

export function shouldShowTrailingEllipsis(currentPage: number, totalPages: number): boolean {
    return totalPages > 5 && currentPage < totalPages - 3
}
