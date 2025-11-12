import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type React from "react";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkCollapsiblesProps {
  artwork: Artwork;
  isShippingOpen: boolean;
  setIsShippingOpen: (open: boolean) => void;
  isGuaranteeOpen: boolean;
  setIsGuaranteeOpen: (open: boolean) => void;
}

export const ArtworkCollapsibles: React.FC<ArtworkCollapsiblesProps> = ({
  artwork,
  isShippingOpen,
  setIsShippingOpen,
  isGuaranteeOpen,
  setIsGuaranteeOpen,
}) => (
  <div className="space-y-4">
    <Collapsible open={isShippingOpen} onOpenChange={setIsShippingOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b py-3">
        <span className="font-medium">Shipping and taxes</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isShippingOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <p className="mb-2 text-muted-foreground text-sm">
          <span className="cursor-pointer underline">
            Estimate Shipping Cost
          </span>
        </p>
      </CollapsibleContent>
    </Collapsible>
    <Collapsible open={isGuaranteeOpen} onOpenChange={setIsGuaranteeOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b py-3">
        <span className="font-medium">
          Be covered by the Artsy Guarantee when you check out with Artsy
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isGuaranteeOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <p className="text-muted-foreground text-sm">
          Artsy's guarantee covers you in case the work is not as described or
          damaged during shipping.
        </p>
      </CollapsibleContent>
    </Collapsible>
  </div>
);
