import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useGetPresignedImageUploadUrl } from "@/queries/uploadQueries"
import { useCreateBlogPost } from "@/services/blog"
import { uploadFileToS3 } from "@/services/upload"
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface CreateBlogFormData {
    title: string
    content: string
    excerpt?: string
    featuredImage?: string
}

interface CreateBlogModalProps {
    isOpen?: boolean
    onClose?: () => void
}

export function CreateBlogModal({ isOpen, onClose }: CreateBlogModalProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = isOpen !== undefined ? isOpen : internalOpen
    const setOpen = (value: boolean) => {
        if (isOpen === undefined) {
            setInternalOpen(value)
        } else if (onClose && !value) {
            onClose()
        }
    }
    const { user } = useAuth()
    const navigate = useNavigate()
    const createBlog = useCreateBlogPost()
    const { mutateAsync: getPresignedUrl } = useGetPresignedImageUploadUrl()

    // Image upload states
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("")
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<CreateBlogFormData>()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB")
            return
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        setFeaturedImageFile(file)
        setFeaturedImagePreview(URL.createObjectURL(file))
    }

    const handleRemoveImage = () => {
        setFeaturedImageFile(null)
        setFeaturedImagePreview("")
        setValue("featuredImage", "")
    }

    const onSubmit = async (data: CreateBlogFormData) => {
        if (!user) {
            toast.error("Please login to create a blog post")
            return
        }

        try {
            let imageUrl = data.featuredImage

            // Upload image if selected
            if (featuredImageFile) {
                setIsUploadingImage(true)
                try {
                    const presignedResponse = await getPresignedUrl({
                        fileName: featuredImageFile.name,
                        contentType: featuredImageFile.type,
                        expirySeconds: 3600
                    })

                    if (!presignedResponse.success || !presignedResponse.presignedUrl) {
                        throw new Error("Failed to get upload URL")
                    }

                    await uploadFileToS3(presignedResponse.presignedUrl, featuredImageFile)
                    imageUrl = presignedResponse.publicUrl
                    toast.success("Featured image uploaded successfully!")
                } catch (uploadError: any) {
                    console.error("Failed to upload featured image:", uploadError)
                    toast.error(
                        `Failed to upload featured image: ${uploadError?.message || "Unknown error"}`
                    )
                    setIsUploadingImage(false)
                    return
                } finally {
                    setIsUploadingImage(false)
                }
            }

            const result = await createBlog.mutateAsync({
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                featuredImage: imageUrl,
                published: false // Start as draft
            })

            reset()
            setFeaturedImageFile(null)
            setFeaturedImagePreview("")
            setOpen(false)

            // Navigate to success page
            navigate("/blog/success", {
                state: { blogTitle: data.title }
            })
        } catch (error: any) {
            console.error("Failed to create blog post:", error)
            toast.error(`Failed to create blog post: ${error?.message || "Please try again."}`)
        }
    }

    if (!user) {
        return null
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
                                    message: "Title must be at least 3 characters"
                                },
                                maxLength: {
                                    value: 200,
                                    message: "Title must be less than 200 characters"
                                }
                            })}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                        <Textarea
                            id="excerpt"
                            placeholder="A short summary of your blog post..."
                            rows={3}
                            {...register("excerpt", {
                                maxLength: {
                                    value: 500,
                                    message: "Excerpt must be less than 500 characters"
                                }
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
                                    className="cursor-pointer text-gray-600 text-sm hover:text-gray-900"
                                >
                                    Click to upload featured image
                                </Label>
                                <Input
                                    id="featuredImageInput"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                        {errors.featuredImage && (
                            <p className="text-red-500 text-sm">{errors.featuredImage.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                            id="content"
                            placeholder="Write your blog post content here... (HTML supported)"
                            rows={15}
                            className="font-mono text-sm"
                            {...register("content", {
                                required: "Content is required",
                                minLength: {
                                    value: 50,
                                    message: "Content must be at least 50 characters"
                                }
                            })}
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm">{errors.content.message}</p>
                        )}
                        <p className="text-gray-500 text-xs">
                            You can use HTML tags for formatting. Minimum 50 characters required.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset()
                                setOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createBlog.isPending || isUploadingImage}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {createBlog.isPending || isUploadingImage ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isUploadingImage ? "Uploading..." : "Creating..."}
                                </>
                            ) : (
                                "Create Blog Post"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
