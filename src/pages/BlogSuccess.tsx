import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, Home } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function BlogSuccessPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const blogTitle = (location.state as any)?.blogTitle

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4">
            <div className="w-full max-w-2xl text-center">
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-100 p-6">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="mb-8 space-y-4">
                    <h1 className="font-bold text-4xl text-gray-900">
                        Blog Post Created Successfully!
                    </h1>
                    {blogTitle && (
                        <p className="font-medium text-gray-700 text-xl">"{blogTitle}"</p>
                    )}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-left">
                        <div className="flex items-start gap-3">
                            <BookOpen className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                            <div className="space-y-2">
                                <p className="font-medium text-gray-800">
                                    Your blog post is now pending admin review.
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Once an admin approves your post, you'll be able to publish it
                                    and make it publicly available. You can check the status of your
                                    blog posts in the "My Blogs" section.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        onClick={() => navigate("/blog")}
                        className="bg-red-700 px-8 py-6 text-lg text-white hover:bg-red-800"
                        size="lg"
                    >
                        <BookOpen className="mr-2 h-5 w-5" />
                        View All Blogs
                    </Button>
                    <Button
                        onClick={() => navigate("/blog/my-blogs")}
                        variant="outline"
                        className="border-2 px-8 py-6 text-lg"
                        size="lg"
                    >
                        My Blogs
                    </Button>
                    <Button
                        onClick={() => navigate("/buyart")}
                        variant="outline"
                        className="border-2 px-8 py-6 text-lg"
                        size="lg"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Back to Artworks
                    </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 border-gray-200 border-t pt-8">
                    <p className="text-gray-500 text-sm">
                        You can edit your blog post within 7 days of creation. After that, it will
                        be locked for editing.
                    </p>
                </div>
            </div>
        </div>
    )
}
