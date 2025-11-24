import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, BookOpen, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const blogTitle = (location.state as any)?.blogTitle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Blog Post Created Successfully!
          </h1>
          {blogTitle && (
            <p className="text-xl text-gray-700 font-medium">
              "{blogTitle}"
            </p>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">
                  Your blog post is now pending admin review.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Once an admin approves your post, you'll be able to publish it and make it publicly available. 
                  You can check the status of your blog posts in the "My Blogs" section.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/blog")}
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg"
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            View All Blogs
          </Button>
          <Button
            onClick={() => navigate("/blog/my-blogs")}
            variant="outline"
            className="px-8 py-6 text-lg border-2"
            size="lg"
          >
            My Blogs
          </Button>
          <Button
            onClick={() => navigate("/buyart")}
            variant="outline"
            className="px-8 py-6 text-lg border-2"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Artworks
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            You can edit your blog post within 7 days of creation. After that, it will be locked for editing.
          </p>
        </div>
      </div>
    </div>
  );
}

