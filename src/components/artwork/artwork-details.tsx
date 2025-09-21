import { Shield, Verified } from "lucide-react";

export const ArtworkDetails = () => (
  <div className="space-y-4">
    {/* Artist and Title */}
    <div>
      <h1 className="mb-1 text-2xl">Niina Villanueva</h1>
      <h2 className="mb-4 text-muted-foreground text-xl italic">
        Memento Mori Pajaro, 2025
      </h2>
      <div className="space-y-0 text-muted-foreground text-sm">
        <p>Oil on canvas</p>
        <p>16 9/10 × 13 in | 43 × 33 cm</p>
        <p>Frame included</p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-muted-foreground underline">
        <Shield className="mr-1 h-3 w-3" />
        Unique work
      </div>
    </div>
    {/* Curators' Pick */}
    <div className="rounded-lg bg-muted/50 text-muted-foreground ">
      <div className="mb-2 flex items-center gap-2">
        <Verified size={16} />
        <span className="font-medium text-sm">Curators' Pick</span>
      </div>
      <p className="text-muted-foreground text-sm">
        Hand selected by Artsy curators this week
      </p>
    </div>
  </div>
);
