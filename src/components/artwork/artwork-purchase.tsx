import { Button } from "@/components/ui/button";

export const ArtworkPurchase = () => (
  <div className="space-y-4">
    <div className=" text-3xl">1,600 Birr</div>
    <div className="space-y-3">
      <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800">
        Purchase
      </Button>
      <Button variant="outline" className="w-full rounded-full bg-transparent">
        Make an Offer
      </Button>
    </div>
  </div>
);
