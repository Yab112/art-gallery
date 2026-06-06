import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { useUpdateBlogPost } from "@/services/blog";
import { uploadFileToS3 } from "@/services/upload";
import { BlogPost } from "@/types/blog.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title is required and must be at least 3 characters."),
  excerpt: z
    .string()
    .max(500, "Excerpt cannot exceed 500 characters.")
    .optional(),
  content: z
    .string()
    .min(50, "Content is required and must be at least 50 characters."),
  featuredImage: z.string().optional(),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

interface BlogEditSheetProps {
  blogPost: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogEditSheet({
  blogPost,
  isOpen,
  onClose,
}: BlogEditSheetProps) {
  const updateBlog = useUpdateBlogPost(blogPost?.id || "");
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();

  // Image upload states
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditBlogFormData>({
    resolver: zodResolver(editBlogSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
    },
  });

  const featuredImage = watch("featuredImage");

  // Populate form when blog post loads
  useEffect(() => {
    if (blogPost && isOpen) {
      reset({
        title: blogPost.title,
        excerpt: blogPost.excerpt || "",
        content: blogPost.content,
        featuredImage: blogPost.featuredImage || "",
      });
      if (blogPost.featuredImage) {
        setFeaturedImagePreview(blogPost.featuredImage);
      } else {
        setFeaturedImagePreview("");
      }
      setFeaturedImageFile(null);
    }
  }, [blogPost, reset, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setValue("featuredImage", "");
  };

  const onSubmit = async (data: EditBlogFormData) => {
    if (!blogPost) return;

    try {
      let imageUrl = data.featuredImage;

      // Upload new image if selected
      if (featuredImageFile) {
        setIsUploadingImage(true);
        setUploadProgress(0);
        try {
          const presignedResponse = await getPresignedUrl({
            fileName: featuredImageFile.name,
            contentType: featuredImageFile.type,
            expirySeconds: 3600,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get upload URL");
          }

          await uploadFileToS3(
            presignedResponse.presignedUrl,
            featuredImageFile,
            featuredImageFile.type,
            (progress) => setUploadProgress(progress),
          );
          imageUrl = presignedResponse.publicUrl;
        } catch (uploadError: any) {
          console.error("Failed to upload featured image:", uploadError);
          toast.error(
            `Failed to upload image: ${uploadError?.message || "Unknown error"}`,
          );
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      await updateBlog.mutateAsync({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: imageUrl,
      });

      toast.success("Blog post updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to update blog post:", error);
      toast.error(
        `Failed to update blog post: ${error?.response?.data?.message || error?.message || "Please try again."}`,
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] border-black bg-white p-0 rounded-none shadow-2xl">
        <DialogHeader className="sticky top-0 z-20 bg-white border-b border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-black text-2xl text-gray-900 uppercase tracking-tighter">
              Edit Story
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-none hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Title */}
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400"
              >
                Story Title
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter a compelling title..."
                className="h-14 rounded-none border-gray-200 text-xl font-bold placeholder:text-gray-300 focus-visible:ring-0 focus-visible:border-black transition-colors"
              />
              {errors.title && (
                <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-3">
              <Label
                htmlFor="excerpt"
                className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400"
              >
                Brief Summary
              </Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="What is this story about?"
                className="min-h-[100px] rounded-none border-gray-200 resize-none placeholder:text-gray-300 focus-visible:ring-0 focus-visible:border-black transition-colors"
              />
              {errors.excerpt && (
                <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">
                  {errors.excerpt.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400"
              >
                The Narrative
              </Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write your story here..."
                className="min-h-[400px] rounded-none border-gray-200 font-serif text-lg leading-relaxed placeholder:text-gray-300 focus-visible:ring-0 focus-visible:border-black transition-colors"
              />
              {errors.content && (
                <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Featured Image */}
            <div className="space-y-4 pt-4">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
                Cover Image
              </Label>

              <div className="relative group aspect-video w-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-colors hover:border-gray-400">
                {featuredImagePreview ? (
                  <>
                    <img
                      src={featuredImagePreview}
                      alt="Cover Preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="rounded-none font-bold text-[10px] uppercase tracking-widest"
                      >
                        Remove Image
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Plus className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Upload Cover
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 pt-8 pb-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting || isUploadingImage}
                className="rounded-none font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900"
              >
                Discard Changes
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="h-14 rounded-none bg-black px-12 font-black text-white text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-red-700 disabled:bg-gray-200"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImage
                      ? `Uploading ${uploadProgress}%`
                      : "Syncing..."}
                  </>
                ) : (
                  <>
                    Update Story <Save className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
