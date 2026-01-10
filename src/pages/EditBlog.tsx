import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetBlogPost, useUpdateBlogPost } from "@/services/blog";
import { useAuth } from "@/hooks/use-auth";
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries";
import { uploadFileToS3 } from "@/services/upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Image as ImageIcon, X, Save } from "lucide-react";
import { BlogDetailSkeleton } from "@/components/blog/blog-detail-skeleton";

const editBlogSchema = z.object({
  title: z.string().min(3, "Title is required and must be at least 3 characters."),
  excerpt: z.string().max(500, "Excerpt cannot exceed 500 characters.").optional(),
  content: z.string().min(50, "Content is required and must be at least 50 characters."),
  featuredImage: z.string().optional(),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

export default function EditBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: blogPost, isLoading, error } = useGetBlogPost(slug || "", false);
  const updateBlog = useUpdateBlogPost(blogPost?.id || "");
  const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl();

  // Get return path from location state
  const returnTo = (location.state as any)?.returnTo || "/blog/my-blogs";
  const returnState = (location.state as any)?.returnState;

  // Image upload states
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    if (blogPost) {
      reset({
        title: blogPost.title,
        excerpt: blogPost.excerpt || "",
        content: blogPost.content,
        featuredImage: blogPost.featuredImage || "",
      });
      if (blogPost.featuredImage) {
        setFeaturedImagePreview(blogPost.featuredImage);
      }
    }
  }, [blogPost, reset]);

  // Check if user is the author
  useEffect(() => {
    if (blogPost && user && blogPost.authorId !== user.id) {
      toast.error("You can only edit your own blog posts");
      navigate(returnTo, { state: returnState });
    }
  }, [blogPost, user, navigate, returnTo, returnState]);

  // Check if post is within 7-day edit window
  useEffect(() => {
    if (blogPost) {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(blogPost.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreation > 7) {
        toast.error("You can only edit your blog post within 7 days of creation");
        navigate(returnTo, { state: returnState });
      }
    }
  }, [blogPost, navigate, returnTo, returnState]);

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
    if (!user || !blogPost) {
      toast.error("Please login to edit a blog post");
      return;
    }

    if (blogPost.authorId !== user.id) {
      toast.error("You can only edit your own blog posts");
      return;
    }

    try {
      let imageUrl = data.featuredImage;

      // Upload new image if selected
      if (featuredImageFile) {
        setIsUploadingImage(true);
        try {
          const presignedResponse = await getPresignedUrl({
            fileName: featuredImageFile.name,
            contentType: featuredImageFile.type,
            expirySeconds: 3600,
          });

          if (!presignedResponse.success || !presignedResponse.presignedUrl) {
            throw new Error("Failed to get upload URL");
          }

          await uploadFileToS3(presignedResponse.presignedUrl, featuredImageFile);
          imageUrl = presignedResponse.publicUrl;
          toast.success("Featured image uploaded successfully!");
        } catch (uploadError: any) {
          console.error("Failed to upload featured image:", uploadError);
          toast.error("Failed to upload featured image: " + (uploadError?.message || "Unknown error"));
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
      navigate(returnTo, { state: returnState });
    } catch (error: any) {
      console.error("Failed to update blog post:", error);
      toast.error("Failed to update blog post: " + (error?.response?.data?.message || error?.message || "Please try again."));
    }
  };

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-4">The blog post you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate(returnTo, { state: returnState })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (blogPost.authorId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You can only edit your own blog posts.</p>
          <Button onClick={() => navigate(returnTo, { state: returnState })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(returnTo, { state: returnState })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter blog post title"
                className="text-lg"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="A short summary of your blog post"
                className="min-h-[100px]"
              />
              {errors.excerpt && (
                <p className="text-sm text-red-500">{errors.excerpt.message}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write your blog post content here (HTML or Markdown supported)"
                className="min-h-[400px] font-mono text-sm"
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {featuredImageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {(featuredImagePreview || featuredImage) && (
                <div className="mt-4">
                  <img
                    src={featuredImagePreview || featuredImage}
                    alt="Featured Preview"
                    className="max-w-full h-64 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
              {errors.featuredImage && (
                <p className="text-sm text-red-500">{errors.featuredImage.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(returnTo, { state: returnState })}
                disabled={isSubmitting || isUploadingImage}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="bg-red-700 hover:bg-red-800"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}












