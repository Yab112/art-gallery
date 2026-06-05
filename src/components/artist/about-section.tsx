import type { UserProfile } from "@/types/user.types"
import { Calendar, Globe, MapPin, Palette, Phone, Users } from "lucide-react"

interface AboutSectionProps {
    user: UserProfile
}

export function AboutSection({ user }: AboutSectionProps) {
    return (
        <div className="max-w-4xl space-y-12">
            {/* Artist Biography */}
            {user.bio && (
                <section>
                    <h2 className="mb-6 font-light text-2xl text-foreground">Biography</h2>
                    <div className="prose prose-lg max-w-none text-foreground">
                        <p className="mb-4 whitespace-pre-line leading-relaxed">{user.bio}</p>
                    </div>
                </section>
            )}

            {/* Key Information */}
            <section>
                <h2 className="mb-6 font-light text-2xl text-foreground">Artist Information</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        {user.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Location</p>
                                    <p className="text-muted-foreground">{user.location}</p>
                                </div>
                            </div>
                        )}
                        {user.website && (
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Website</p>
                                    <a
                                        href={user.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground underline hover:text-foreground"
                                    >
                                        {user.website}
                                    </a>
                                </div>
                            </div>
                        )}
                        {user.artworkCount !== undefined && user.artworkCount > 0 && (
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Artworks</p>
                                    <p className="text-muted-foreground">
                                        {user.artworkCount}{" "}
                                        {user.artworkCount === 1 ? "artwork" : "artworks"} available
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {user.createdAt && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Member Since</p>
                                    <p className="text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long"
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {user.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Phone</p>
                                    <a
                                        href={`tel:${user.phone}`}
                                        className="text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {user.phone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {user.email && (
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Contact</p>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Show message if no bio */}
            {!user.bio && (
                <section>
                    <div className="rounded-lg border border-gray-300 border-dashed py-12 text-center">
                        <p className="text-muted-foreground">
                            {user.name || "This artist"} hasn't added a biography yet.
                        </p>
                    </div>
                </section>
            )}
        </div>
    )
}
