import { ArtistBlogPreview } from "@/components/blog/artist-blog-preview"

interface UserBlogsProps {
    userId: string
    artistName?: string
}

export function UserBlogs({ userId, artistName }: UserBlogsProps) {
    return (
        <ArtistBlogPreview
            authorId={userId}
            authorName={artistName}
            limit={4}
            className="mt-8 border-gray-200 border-t py-8"
        />
    )
}
