interface BlogEmptyStateProps {
    artistName?: string
}

export function BlogEmptyState({ artistName }: BlogEmptyStateProps) {
    const name = artistName || "This artist"

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-10 sm:px-8">
            <p className="font-medium text-gray-900 text-sm">No blog posts yet</p>
            <p className="mt-1 max-w-md text-gray-500 text-sm leading-relaxed">
                {name} hasn&apos;t published any blog posts yet.
            </p>
        </div>
    )
}
