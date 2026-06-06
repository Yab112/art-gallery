import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetPresignedImageUploadUrl,
  useGetPresignedVideoUploadUrl,
} from "@/queries/uploadQueries";
import { useCreateBlogPost } from "@/services/blog";
import { uploadFileToS3 } from "@/services/upload";
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  X,
  Video,
  Link as LinkIcon,
  Upload,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
} from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateBlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  mediaType: "IMAGE" | "VIDEO";
  videoSource: "URL" | "UPLOAD";
  videoUrl?: string;
}

interface CreateBlogModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateBlogModal({
  isOpen,
  onClose,
}: CreateBlogModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isOpen === undefined) {
      setInternalOpen(value);
    } else if (onClose && !value) {
      onClose();
    }
  };
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBlog = useCreateBlogPost();
  const { mutateAsync: getPresignedImageUrl } = useGetPresignedImageUploadUrl();
  const { mutateAsync: getPresignedVideoUrl } = useGetPresignedVideoUploadUrl();

  // Image upload states
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Video upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBlogFormData>({
    defaultValues: {
      mediaType: "IMAGE",
      videoSource: "URL",
    },
  });

  const selectedMediaType = watch("mediaType");
  const selectedVideoSource = watch("videoSource");

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: contentFormRef, ...contentRegister } = register("content", {
    required: "Content is required",
    minLength: {
      value: 50,
      message: "Content must be at least 50 characters",
    },
  });

  const insertTag = (tag: string, closingTag?: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const actualClosingTag =
      closingTag || `</${tag.replace("<", "").replace(">", "")}>`;
    const newText = `${before}${tag}${selectedText}${actualClosingTag}${after}`;

    setValue("content", newText, { shouldValidate: true });

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + tag.length + selectedText.length + actualClosingTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setValue("featuredImage", "");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for video)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be less than 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setValue("videoUrl", "");
  };

  const onSubmit = async (data: CreateBlogFormData) => {
    if (!user) {
      toast.error("Please login to create a blog post");
      return;
    }

    try {
      let imageUrl = data.featuredImage;
      let finalVideoUrl = data.videoUrl;

      // 1. Upload Image if selected
      if (featuredImageFile) {
        setIsUploadingImage(true);
        setImageUploadProgress(0);
        try {
          const presignedResponse = await getPresignedImageUrl({
            fileName: featuredImageFile.name,
            contentType: featuredImageFile.type,
            expirySeconds: 3600,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get image upload URL");
          }

          await uploadFileToS3(
            presignedResponse.presignedUrl,
            featuredImageFile,
            featuredImageFile.type,
            (progress) => setImageUploadProgress(progress),
          );
          imageUrl = presignedResponse.publicUrl;
        } catch (uploadError: any) {
          console.error("Failed to upload featured image:", uploadError);
          toast.error("Failed to upload image.");
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // 2. Upload Video if selected
      if (
        data.mediaType === "VIDEO" &&
        data.videoSource === "UPLOAD" &&
        videoFile
      ) {
        setIsUploadingVideo(true);
        setVideoUploadProgress(0);
        try {
          const presignedResponse = await getPresignedVideoUrl({
            fileName: videoFile.name,
            contentType: videoFile.type,
            expirySeconds: 3600,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get video upload URL");
          }

          await uploadFileToS3(
            presignedResponse.presignedUrl,
            videoFile,
            videoFile.type,
            (progress) => setVideoUploadProgress(progress),
          );
          finalVideoUrl = presignedResponse.publicUrl;
        } catch (uploadError: any) {
          console.error("Failed to upload video:", uploadError);
          toast.error("Failed to upload video.");
          setIsUploadingVideo(false);
          return;
        } finally {
          setIsUploadingVideo(false);
        }
      }

      console.log("Submitting blog data:", {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: imageUrl,
        mediaType: data.mediaType,
        videoUrl: finalVideoUrl,
        published: false,
      });

      const result = await createBlog.mutateAsync({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: imageUrl,
        mediaType: data.mediaType,
        videoUrl: finalVideoUrl,
        published: false,
      });

      console.log("Blog creation result:", result);
      toast.success("Blog post created and pending approval!");

      reset();
      setFeaturedImageFile(null);
      setFeaturedImagePreview("");
      setVideoFile(null);
      setVideoPreview("");
      setOpen(false);

      // Navigate to success page
      navigate("/blog/success", {
        state: { blogTitle: data.title },
      });
    } catch (error: any) {
      console.error("Failed to create blog post:", error);
      toast.error(
        `Failed to create blog post: ${error?.message || "Please try again."}`,
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-red-700 hover:bg-red-800">
            <Plus className="mr-2 h-4 w-4" />
            Write Blog
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, insights, and stories with the art community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter blog post title..."
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
                maxLength: {
                  value: 200,
                  message: "Title must be less than 200 characters",
                },
              })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <Select
                value={selectedMediaType}
                onValueChange={(value: "IMAGE" | "VIDEO") =>
                  setValue("mediaType", value)
                }
              >
                <SelectTrigger id="mediaType">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedMediaType === "VIDEO" && (
              <div className="space-y-2">
                <Label htmlFor="videoSource">Video Source</Label>
                <Select
                  value={selectedVideoSource}
                  onValueChange={(value: "URL" | "UPLOAD") =>
                    setValue("videoSource", value)
                  }
                >
                  <SelectTrigger id="videoSource">
                    <SelectValue placeholder="Select video source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URL">
                      External Link (YouTube/Vimeo)
                    </SelectItem>
                    <SelectItem value="UPLOAD">Direct Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedMediaType === "VIDEO" && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              {selectedVideoSource === "URL" ? (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="videoUrl"
                      className="pl-10"
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...register("videoUrl", {
                        required:
                          selectedVideoSource === "URL"
                            ? "Video URL is required"
                            : false,
                      })}
                    />
                  </div>
                  {errors.videoUrl && (
                    <p className="text-red-500 text-sm">
                      {errors.videoUrl.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="videoUpload">Video File *</Label>
                  {videoPreview ? (
                    <div className="relative">
                      <video
                        src={videoPreview}
                        className="h-48 w-full rounded-lg border border-gray-200 object-cover"
                        controls
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-gray-300 border-dashed p-6 text-center bg-white">
                      <Video className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <Label
                        htmlFor="videoUploadInput"
                        className="cursor-pointer text-gray-600 text-sm hover:text-gray-900 block"
                        onClick={() => videoUploadInputRef.current?.click()}
                      >
                        Click to upload video file (max 50MB)
                      </Label>
                      <Input
                        id="videoUploadInput"
                        ref={videoUploadInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              placeholder="A short summary of your blog post..."
              rows={3}
              {...register("excerpt", {
                maxLength: {
                  value: 500,
                  message: "Excerpt must be less than 500 characters",
                },
              })}
            />
            {errors.excerpt && (
              <p className="text-red-500 text-sm">{errors.excerpt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image (Optional)</Label>
            {featuredImagePreview ? (
              <div className="relative">
                <img
                  src={featuredImagePreview}
                  alt="Featured preview"
                  className="h-48 w-full rounded-lg border border-gray-200 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-gray-300 border-dashed p-6 text-center">
                <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <Label
                  htmlFor="featuredImageInput"
                  className="cursor-pointer text-gray-600 text-sm hover:text-gray-900 block"
                  onClick={() => featuredImageInputRef.current?.click()}
                >
                  Click to upload featured image
                </Label>
                <Input
                  id="featuredImageInput"
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
            {errors.featuredImage && (
              <p className="text-red-500 text-sm">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <div className="flex flex-col rounded-md border border-gray-200">
              {/* Toolbar */}
              <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50/50 p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTag("<b>", "</b>")}
                  title="Bold"
                >
                  <Bold size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTag("<i>", "</i>")}
                  title="Italic"
                >
                  <Italic size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTag("<h2>", "</h2>")}
                  title="Heading"
                >
                  <Heading2 size={14} />
                </Button>
                <div className="mx-1 h-4 w-px bg-gray-200" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTag("<blockquote>", "</blockquote>")}
                  title="Quote"
                >
                  <Quote size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}
                  title="List"
                >
                  <List size={14} />
                </Button>
              </div>
              <Textarea
                id="content"
                placeholder="Write your blog post content here..."
                rows={15}
                className="border-0 font-mono text-sm focus-visible:ring-0"
                {...contentRegister}
                ref={(e) => {
                  contentFormRef(e);
                  contentRef.current = e;
                }}
              />
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">
              Rich formatting supported via toolbar. Minimum 50 characters.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createBlog.isPending || isUploadingImage || isUploadingVideo
              }
              className="bg-red-700 hover:bg-red-800"
            >
              {createBlog.isPending || isUploadingImage || isUploadingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage
                    ? `Uploading Image (${imageUploadProgress}%)`
                    : isUploadingVideo
                      ? `Uploading Video (${videoUploadProgress}%)`
                      : "Creating..."}
                </>
              ) : (
                "Create Blog Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
