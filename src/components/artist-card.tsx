import { Button } from "@/components/ui/button";

interface ArtistCardProps {
  name: string;
  nationality?: string;
  birthYear?: string;
  deathYear?: string;
  image: string;
  onFollow?: () => void;
}

export function ArtistCard({
  name,
  nationality,
  birthYear,
  deathYear,
  image,
  onFollow,
}: ArtistCardProps) {
  const formatLifespan = () => {
    if (!nationality && !birthYear) return "";

    let result = "";
    if (nationality) result += nationality;
    if (birthYear) {
      if (nationality) result += ", ";
      result += deathYear ? `${birthYear}-${deathYear}` : `b.${birthYear}`;
    }
    return result;
  };

  return (
    <div className="group w-80 flex-shrink-0">
      <div className="relative mb-4 aspect-square overflow-hidden ">
        <img
          src={image || "/placeholder.svg"}
          alt={`Artwork by ${name}`}
          className="h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="cursor-pointer font-semibold text-gray-900 text-lg hover:underline">
            {name}
          </h3>
          {formatLifespan() && (
            <p className="text-gray-600 text-sm">{formatLifespan()}</p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onFollow}
          className="rounded-full bg-transparent px-6 hover:bg-gray-50"
        >
          See Profile
        </Button>
      </div>
    </div>
  );
}
