import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { userKeys } from "@/queries/queryKeys";

interface UpdateProfileResponse {
  success: boolean;
  profile: any;
}

export interface UpdateProfileDto {
  name?: string;
  avatar?: string; // S3 URL
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  coverImage?: string; // S3 URL
}

export const useUpdateProfile = () => {
  const { mutateAsync, isPending } = useMutationFunc<UpdateProfileResponse, UpdateProfileDto>({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: userKeys.me(),
  });

  const updateProfile = async (data: UpdateProfileDto) => {
    return mutateAsync({
      url: "/profile",
      method: "PUT",
      body: data,
    });
  };

  return {
    updateProfile,
    isUpdating: isPending,
  };
};

