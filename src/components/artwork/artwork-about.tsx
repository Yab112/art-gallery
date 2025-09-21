import { Button } from "@/components/ui/button";

export const ArtworkAbout = () => (
  <div className="my-12 max-w-4xl">
    <h3 className="mb-6 border-b pb-2 text-xl">About the work</h3>
    <div className="grid gap-x-4 gap-y-2 text-sm md:grid-cols-2">
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Materials</span>
        <span className="cursor-pointer underline">Oil on canvas</span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Size</span>
        <span>16 9/10 × 13 in | 43 × 33 cm</span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Rarity</span>
        <span className="cursor-pointer underline">Unique</span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Medium</span>
        <span className="cursor-pointer underline">Painting</span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Signature</span>
        <span>Hand-signed by artist, back</span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">
          Certificate of authenticity
        </span>
        <span className="cursor-pointer underline">
          Included (issued by gallery)
        </span>
      </div>
      <div className="flex justify-between border-gray-100 border-b py-2">
        <span className="text-muted-foreground">Frame</span>
        <span>Included</span>
      </div>
    </div>
    {/* Artist Information */}
    <div className="mt-8 flex items-center justify-between rounded-lg bg-muted/30 ">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-bold text-white">
          NV
        </div>
        <div>
          <h4 className="font-bold">Niina Villanueva</h4>
          <p className="text-muted-foreground text-sm">Finnish, b. 1984</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="lg"
        className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
      >
        See Profile
      </Button>
    </div>
  </div>
);
