import { Button } from "@/components/ui/button";
import { useFollowUser } from "@/services/follow/useFollowUser";
import { useUnfollowUser } from "@/services/follow/useUnfollowUser";
import { useFollowStatus } from "@/services/follow/useFollowStatus";
import { useQueryClient } from "@tanstack/react-query";
import { followKeys } from "@/queries/queryKeys";
import { userKeys } from "@/queries/queryKeys";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
  showFollowBack?: boolean; // Show "Follow Back" instead of "Follow"
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  variant = "default",
  size = "default",
  className,
  onFollowChange,
  showFollowBack = false,
}: FollowButtonProps) {
  const { followUser, isFollowing: isFollowingUser } = useFollowUser();
  const { unfollowUser, isUnfollowing } = useUnfollowUser();
  const { data: followStatus } = useFollowStatus(userId);
  const queryClient = useQueryClient();

  // Use followStatus if available, otherwise fall back to initialIsFollowing
  const isFollowing = followStatus?.isFollowing ?? initialIsFollowing ?? false;
  const isLoading = isFollowingUser || isUnfollowing;

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        onFollowChange?.(false);
      } else {
        await followUser(userId);
        onFollowChange?.(true);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: followKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </>
      ) : isFollowing ? (
        "Unfollow"
      ) : showFollowBack ? (
        "Follow Back"
      ) : (
        "Follow"
      )}
    </Button>
  );
}

