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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useUpdateProfile } from "@/services/users/useUpdateProfile";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { EditProfileSkeleton } from "@/components/skeletons/edit-profile-skeleton";
import { profileFormSchema, type ProfileFormData } from "@/lib/schemas/profile.schema";

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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
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
    mode: "onChange", // Validate on change for better UX
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = form;

  // Watch bio field for character count
  const bioValue = form.watch("bio") || "";

  // Handle browser autofill - browsers don't trigger onChange for autofill
  // This effect uses multiple strategies to detect and sync autofilled values
  useEffect(() => {
    const fieldsToWatch: Array<keyof ProfileFormData> = ['name', 'location', 'website', 'phone', 'bio'];
    
    const syncAllAutofilledValues = () => {
      fieldsToWatch.forEach((fieldName) => {
        const input = document.getElementById(fieldName) as HTMLInputElement | HTMLTextAreaElement | null;
        if (input) {
          const currentFormValue = getValues(fieldName) || '';
          const inputValue = input.value || '';
          
          // Only update if values differ (avoid infinite loops)
          if (inputValue !== currentFormValue && inputValue.trim() !== '') {
            setValue(fieldName, inputValue, { shouldValidate: true, shouldDirty: true });
          }
        }
      });
    };

    // Strategy 1: Poll periodically to catch autofill
    const pollInterval = setInterval(() => {
      syncAllAutofilledValues();
    }, 300); // Check every 300ms

    // Strategy 2: Check on focus/blur
    const handleFocus = () => {
      setTimeout(syncAllAutofilledValues, 150);
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const fieldName = target.id as keyof ProfileFormData;
      if (fieldName && fieldsToWatch.includes(fieldName)) {
        syncAllAutofilledValues();
      }
    };

    // Strategy 3: Use MutationObserver to detect DOM changes (autofill can trigger these)
    const observer = new MutationObserver(() => {
      syncAllAutofilledValues();
    });

    // Strategy 4: Listen for animation events (some browsers use these for autofill)
    const handleAnimationStart = (e: AnimationEvent) => {
      // Browsers often use animation events to detect autofill
      if (e.animationName === 'onAutoFillStart' || e.animationName === 'onAutoFillCancel') {
        setTimeout(syncAllAutofilledValues, 100);
      }
    };

    // Strategy 5: Check on window focus (user might autofill when tab is focused)
    const handleWindowFocus = () => {
      setTimeout(syncAllAutofilledValues, 200);
    };

    // Attach all listeners
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('focusin', handleFocus);
      form.addEventListener('focusout', handleBlur);
      form.addEventListener('animationstart', handleAnimationStart as EventListener);
      
      // Observe the form for changes
      observer.observe(form, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['value', 'style'],
      });
    }

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(pollInterval);
      if (form) {
        form.removeEventListener('focusin', handleFocus);
        form.removeEventListener('focusout', handleBlur);
        form.removeEventListener('animationstart', handleAnimationStart as EventListener);
      }
      observer.disconnect();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [setValue, getValues]);

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

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // CRITICAL: Read values directly from DOM inputs to catch autofill
      // This is the most reliable way to get autofilled values
      const nameInput = document.getElementById("name") as HTMLInputElement | null;
      const locationInput = document.getElementById("location") as HTMLInputElement | null;
      const websiteInput = document.getElementById("website") as HTMLInputElement | null;
      const phoneInput = document.getElementById("phone") as HTMLInputElement | null;
      const bioTextarea = document.getElementById("bio") as HTMLTextAreaElement | null;

      // Get actual DOM values (these will include autofilled values)
      const actualName = nameInput?.value || data.name;
      const actualLocation = locationInput?.value || data.location || '';
      const actualWebsite = websiteInput?.value || data.website || '';
      const actualPhone = phoneInput?.value || data.phone || '';
      const actualBio = bioTextarea?.value || data.bio || '';

      // Sync to form state for validation
      if (nameInput && nameInput.value !== getValues("name")) {
        setValue("name", actualName, { shouldValidate: true, shouldDirty: true });
      }
      if (locationInput && locationInput.value !== getValues("location")) {
        setValue("location", actualLocation, { shouldValidate: true, shouldDirty: true });
      }
      if (websiteInput && websiteInput.value !== getValues("website")) {
        setValue("website", actualWebsite, { shouldValidate: true, shouldDirty: true });
      }
      if (phoneInput && phoneInput.value !== getValues("phone")) {
        setValue("phone", actualPhone, { shouldValidate: true, shouldDirty: true });
      }
      if (bioTextarea && bioTextarea.value !== getValues("bio")) {
        setValue("bio", actualBio, { shouldValidate: true, shouldDirty: true });
      }

      // Use actual DOM values instead of form state
      const latestData = {
        name: actualName,
        location: actualLocation,
        website: actualWebsite,
        phone: actualPhone,
        bio: actualBio,
        avatar: data.avatar,
        coverImage: data.coverImage,
        email: data.email,
      };

      let avatarUrl = latestData.avatar || data.avatar;
      let coverImageUrl = latestData.coverImage || data.coverImage;

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

      // Update profile with all data (use actual DOM values to include autofilled values)
      await updateProfile({
        name: latestData.name,
        avatar: avatarUrl,
        bio: latestData.bio || undefined, // Convert empty string to undefined
        location: latestData.location || undefined,
        website: latestData.website || undefined,
        phone: latestData.phone || undefined,
        coverImage: coverImageUrl,
      });
      navigate("/profile");
    } catch (error: any) {
      // Error is already handled in useUpdateProfile hook
      // But we can add additional handling here if needed
      console.error("Profile update error:", error);
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
      {/* CSS to detect autofill and trigger animation */}
      <style>{`
        @keyframes onAutoFillStart {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input:-webkit-autofill,
        textarea:-webkit-autofill {
          animation-name: onAutoFillStart;
          animation-duration: 0.001s;
        }
      `}</style>
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
                  {...register("name", {
                    onChange: (e) => {
                      setValue("name", e.target.value, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                  onInput={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    if (value !== getValues("name")) {
                      setValue("name", value, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  placeholder="Your full name"
                  maxLength={100}
                  autoComplete="name"
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
                  {...register("email")}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Bio</Label>
                  <span className={`text-xs ${bioValue.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                    {bioValue.length}/500 characters
                  </span>
                </div>
                <Textarea
                  id="bio"
                  {...register("bio", {
                    onChange: (e) => {
                      setValue("bio", e.target.value, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                  onInput={(e) => {
                    const value = (e.target as HTMLTextAreaElement).value;
                    if (value !== getValues("bio")) {
                      setValue("bio", value, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location", {
                    onChange: (e) => {
                      setValue("location", e.target.value, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                  placeholder="City, Country"
                  maxLength={100}
                  autoComplete="address-level2"
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
                  {...register("website")}
                  placeholder="https://example.com"
                  maxLength={200}
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
                  {...register("phone", {
                    onChange: (e) => {
                      setValue("phone", e.target.value, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                  onInput={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    if (value !== getValues("phone")) {
                      setValue("phone", value, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
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
