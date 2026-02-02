import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Artwork } from "@/types/artwork.types"
import { ChevronDown } from "lucide-react"
import type React from "react"

interface ArtworkCollapsiblesProps {
    artwork: Artwork
    isShippingOpen: boolean
    setIsShippingOpen: (open: boolean) => void
    isGuaranteeOpen: boolean
    setIsGuaranteeOpen: (open: boolean) => void
}

export const ArtworkCollapsibles: React.FC<ArtworkCollapsiblesProps> = ({
    artwork,
    isShippingOpen,
    setIsShippingOpen,
    isGuaranteeOpen,
    setIsGuaranteeOpen
}) => (
    <div className="space-y-2">
        <Collapsible open={isShippingOpen} onOpenChange={setIsShippingOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-gray-200 border-b py-2">
                <span className="font-medium text-gray-900 text-sm">Shipping and taxes</span>
                <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                        isShippingOpen ? "rotate-180" : ""
                    }`}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
                <p className="text-gray-600 text-xs">
                    <span className="cursor-pointer underline">Estimate Shipping Cost</span>
                </p>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isGuaranteeOpen} onOpenChange={setIsGuaranteeOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-gray-200 border-b py-2">
                <span className="font-medium text-gray-900 text-sm">
                    Be covered by the Artsy Guarantee when you check out with Artsy
                </span>
                <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                        isGuaranteeOpen ? "rotate-180" : ""
                    }`}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
                <p className="text-gray-600 text-xs">
                    Artsy's guarantee covers you in case the work is not as described or damaged
                    during shipping.
                </p>
            </CollapsibleContent>
        </Collapsible>
    </div>
)
