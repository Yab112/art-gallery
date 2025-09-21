import { Button } from "@/components/ui/button";

export const ArtworkGalleryInfo = () => (
  <div className="border-t pt-6">
    <div className="mb-2 flex items-center justify-between">
      <div>
        <h3 className="font-bold">MAKASIINI CONTEMPORARY</h3>
        <p className="text-muted-foreground text-sm">Turku, Helsinki</p>
      </div>
      <Button
        variant="outline"
        size="lg"
        className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
      >
        Contact Gallery
      </Button>
    </div>
  </div>
);
