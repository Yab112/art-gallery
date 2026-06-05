import { Button } from "@/components/ui/button"
import {
    getVisiblePageNumbers,
    shouldShowLeadingEllipsis,
    shouldShowLeadingPageJump,
    shouldShowTrailingEllipsis,
    shouldShowTrailingPageJump
} from "@/lib/pagination"
import { cn } from "@/lib/utils"

export interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    /** When set, shows summary text below controls (blog-style) */
    totalItems?: number
    itemLabel?: string
    itemLabelSingular?: string
    className?: string
    /** Show summary when only one page exists (requires totalItems) */
    showSinglePageSummary?: boolean
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemLabel = "items",
    itemLabelSingular,
    className,
    showSinglePageSummary = false
}: PaginationControlsProps) {
    const singular = itemLabelSingular ?? (itemLabel.endsWith("s") ? itemLabel.slice(0, -1) : itemLabel)

    if (totalPages <= 0) {
        if (showSinglePageSummary && totalItems !== undefined && totalItems > 0) {
            return (
                <div className={cn("mt-8 flex flex-col items-center justify-center gap-4", className)}>
                    <p className="text-gray-500 text-sm">
                        Showing all {totalItems} {totalItems === 1 ? singular : itemLabel}
                    </p>
                </div>
            )
        }
        return null
    }

    if (totalPages === 1) {
        if (!showSinglePageSummary || totalItems === undefined) return null

        return (
            <div className={cn("mt-8 flex flex-col items-center justify-center gap-4", className)}>
                <p className="text-gray-500 text-sm">
                    Showing all {totalItems} {totalItems === 1 ? singular : itemLabel}
                </p>
            </div>
        )
    }

    const visiblePages = getVisiblePageNumbers(currentPage, totalPages)

    return (
        <div className={cn("mt-8 flex flex-col items-center justify-center gap-4", className)}>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="min-w-[80px]"
                >
                    Previous
                </Button>

                <div className="flex items-center gap-1">
                    {shouldShowLeadingPageJump(currentPage, totalPages) && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(1)}
                                className="min-w-[40px]"
                            >
                                1
                            </Button>
                            {shouldShowLeadingEllipsis(currentPage, totalPages) && (
                                <span className="px-2 text-gray-500">...</span>
                            )}
                        </>
                    )}

                    {visiblePages.map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                            className={
                                currentPage === pageNum
                                    ? "min-w-[40px] bg-red-700 hover:bg-red-800"
                                    : "min-w-[40px]"
                            }
                        >
                            {pageNum}
                        </Button>
                    ))}

                    {shouldShowTrailingPageJump(currentPage, totalPages) && (
                        <>
                            {shouldShowTrailingEllipsis(currentPage, totalPages) && (
                                <span className="px-2 text-gray-500">...</span>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(totalPages)}
                                className="min-w-[40px]"
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="min-w-[80px]"
                >
                    Next
                </Button>
            </div>

            {totalItems !== undefined && (
                <p className="text-gray-500 text-sm">
                    Page {currentPage} of {totalPages} • {totalItems} total {itemLabel}
                </p>
            )}
        </div>
    )
}
