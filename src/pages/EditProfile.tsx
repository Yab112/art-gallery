import { useMyProfile } from "@/queries/userQueries";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Save,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { EditProfileSkeleton } from "@/components/skeletons/edit-profile-skeleton";

interface EditProfileFormData {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  avatar?: string;
  coverImage?: string;
}

export default function EditProfilePage() {
  const { user: sessionUser } = useAuth();
  const { data: profileData, isLoading, error } = useMyProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const navigate = useNavigate();
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();

  const profile = profileData?.profile || sessionUser;

  // Image upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const form = useForm<EditProfileFormData>({
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      bio: (profile as any)?.bio || "",
      location: (profile as any)?.location || "",
      website: (profile as any)?.website || "",
      phone: (profile as any)?.phone || "",
      avatar: profile?.image || "",
      coverImage: (profile as any)?.coverImage || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        email: profile.email || "",
        bio: (profile as any)?.bio || "",
        location: (profile as any)?.location || "",
        website: (profile as any)?.website || "",
        phone: (profile as any)?.phone || "",
        avatar: profile.image || "",
        coverImage: (profile as any)?.coverImage || "",
      });
      if (profile.image) {
        setAvatarPreview(profile.image);
      }
      if ((profile as any)?.coverImage) {
        setCoverImagePreview((profile as any).coverImage);
      }
    }
  }, [profile, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      let avatarUrl = data.avatar;
      let coverImageUrl = data.coverImage;

      // Upload avatar if selected
      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const presignedResponse = await getPresignedUrl({
            fileName: avatarFile.name,
            contentType: avatarFile.type,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get upload URL");
          }

          await uploadFileToS3(presignedResponse.presignedUrl, avatarFile);
          avatarUrl = presignedResponse.publicUrl;
          toast.success("Profile picture uploaded successfully");
        } catch (error: any) {
          toast.error(
            "Failed to upload profile picture: " +
              (error?.message || "An error occurred") 
          );
          setIsUploadingAvatar(false);
          return;
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Upload cover image if selected
      if (coverImageFile) {
        setIsUploadingCover(true);
        try {
          const presignedResponse = await getPresignedUrl({
            fileName: coverImageFile.name,
            contentType: coverImageFile.type,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get upload URL");
          }

          await uploadFileToS3(presignedResponse.presignedUrl, coverImageFile);
          coverImageUrl = presignedResponse.publicUrl;
          toast.success("Cover image uploaded successfully");
        } catch (error: any) {
          toast.error(
            "Failed to upload cover image: " +
              (error?.message || "An error occurred")
          );
          setIsUploadingCover(false);
          return;
        } finally {
          setIsUploadingCover(false);
        }
      }

      // Update profile with all data
      await updateProfile({
        name: data.name,
        avatar: avatarUrl,
        bio: data.bio,
        location: data.location,
        website: data.website,
        phone: data.phone,
        coverImage: coverImageUrl,
      });
      navigate("/profile");
    } catch (error: any) {
      toast.error(
        "Failed to update profile: " + (error?.message || "An error occurred")
      );
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <EditProfileSkeleton />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={User}
          title="Error Loading Profile"
          description="Failed to load your profile information. Please try again later."
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={User}
          title="Profile Not Found"
          description="We couldn't find your profile information to edit."
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Edit Profile
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Update your profile information
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(profile?.image || "");
                          setValue("avatar", profile?.image || "");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size must be less than 5MB");
                          return;
                        }

                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select an image file");
                          return;
                        }

                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }}
                    />
                    <Label
                      htmlFor="avatarInput"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarPreview ? "Change Picture" : "Upload Picture"}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <div className="space-y-2">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview(
                            (profile as any)?.coverImage || ""
                          );
                          setValue(
                            "coverImage",
                            (profile as any)?.coverImage || ""
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <Label
                        htmlFor="coverImageInput"
                        className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
                      >
                        Click to upload cover image
                      </Label>
                      <Input
                        id="coverImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image size must be less than 5MB");
                            return;
                          }

                          if (!file.type.startsWith("image/")) {
                            toast.error("Please select an image file");
                            return;
                          }

                          setCoverImageFile(file);
                          setCoverImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="your.email@example.com"
                  disabled // Email is usually not directly editable here
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
                {profile.emailVerified ? (
                  <p className="text-xs text-green-600">✓ Email verified</p>
                ) : (
                  <p className="text-xs text-yellow-600">
                    ⚠ Email not verified
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="City, Country"
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register("website", {
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message:
                        "Please enter a valid URL (e.g., https://example.com)",
                    },
                  })}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="text-sm text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || isUploadingAvatar || isUploadingCover}
                  className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white"
                >
                  <Save className="h-4 w-4" />
                  {isUploadingAvatar || isUploadingCover
                    ? "Uploading..."
                    : isUpdating
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
