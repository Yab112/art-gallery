import { Button } from "@/components/ui/button";
import { Bell, Heart, Share2 } from "lucide-react";
import { useState } from "react";

export function ArtistProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="mb-12">
      {/* <SectionTitle title="Artist Profile" subtitle="Meet the artist" /> */}
      <div className="mt-8 flex flex-col items-start gap-8 lg:flex-row">
        {/* Artist Image */}
        <div className="flex-shrink-0">
          <div className="zoom-container h-80 w-80 overflow-hidden rounded-lg bg-gallery-neutral">
            <img
              src="/artist-1.webp"
              alt="Carlos Jacanamijoy profile"
              className="zoom-image h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Artist Info */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="mb-2 text-balance font-light text-4xl text-foreground">
              Carlos Jacanamijoy
            </h1>
            <p className="font-light text-muted-foreground text-xl">
              Colombian, b. 1964
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isFollowing ? "secondary" : "outline"}
              size="lg"
              className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-black bg-white text-black hover:bg-gray-100"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-black bg-white text-black hover:bg-gray-100"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-current text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-black bg-white text-black hover:bg-gray-100"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Follower Count */}
          <p className="text-muted-foreground text-sm">363 Followers</p>

          {/* Artist Bio */}
          <div className="max-w-3xl">
            <p className="text-pretty text-foreground leading-relaxed">
              Carlos Jacanamijoy depicts vivid, colour-saturated and abstract
              landscapes that emphasise the respect for heritage, memory and
              environment that he was taught as a Colombian indigenous of the
              Inga people. While his paintings are made abiding by the...{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
              >
                Read more
              </button>
            </p>
          </div>

          {/* Additional Info */}
          <div className="pt-4">
            <button
              type="button"
              className="text-muted-foreground text-sm underline transition-colors hover:text-foreground"
            >
              See all past shows and fair booths
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
