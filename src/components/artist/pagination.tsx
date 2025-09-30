import { Button } from "@/components/ui/button";

interface PaginationProps {
  onLoadMore?: () => void;
}

export function Pagination({ onLoadMore }: PaginationProps) {
  return (
    <div className="text-center">
      <Button
        variant="outline"
        size="lg"
        className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
        onClick={onLoadMore}
      >
        Load More Artworks
      </Button>
    </div>
  );
}
