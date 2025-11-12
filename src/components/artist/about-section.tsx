import { Button } from "@/components/ui/button";
import {
  Award,
  Calendar,
  ExternalLink,
  MapPin,
  Palette,
  Users,
} from "lucide-react";
import type { UserProfile } from "@/types/user.types";

interface AboutSectionProps {
  user: UserProfile;
}

export function AboutSection({ user }: AboutSectionProps) {
  return (
    <div className="max-w-4xl space-y-12">
      {/* Artist Biography */}
      <section>
        <h2 className="mb-6 font-light text-2xl text-foreground">Biography</h2>
        <div className="prose prose-lg max-w-none text-foreground">
          {user.artworkCount !== undefined && user.artworkCount > 0 ? (
            <p className="mb-4 leading-relaxed">
              {user.name || "This artist"} has {user.artworkCount} {user.artworkCount === 1 ? "artwork" : "artworks"} available on our platform.
            </p>
          ) : (
            <p className="mb-4 leading-relaxed">
              {user.name || "This artist"} is a member of our art gallery community.
            </p>
          )}
          {user.createdAt && (
            <p className="mb-4 leading-relaxed">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}.
            </p>
          )}
        </div>
      </section>

      {/* Key Information */}
      <section>
        <h2 className="mb-6 font-light text-2xl text-foreground">
          Artist Information
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Born</p>
                <p className="text-muted-foreground">
                  Santiago, Putumayo, Colombia (1964)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Heritage</p>
                <p className="text-muted-foreground">Inga Indigenous People</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Medium</p>
                <p className="text-muted-foreground">Painting, Mixed Media</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Recognition</p>
                <p className="text-muted-foreground">
                  International Contemporary Art
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Active Since</p>
                <p className="text-muted-foreground">1980s - Present</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibitions & Shows */}
      <section>
        <h2 className="mb-6 font-light text-2xl text-foreground">
          Selected Exhibitions
        </h2>
        <div className="space-y-6">
          <div className="border-primary border-l-2 pl-6">
            <h3 className="mb-1 font-medium text-foreground">
              Solo Exhibition
            </h3>
            <p className="mb-2 text-muted-foreground">
              Galería El Museo, Bogotá, Colombia (2022)
            </p>
            <p className="text-muted-foreground text-sm">
              "Ancestral Visions: Contemporary Expressions of Indigenous Memory"
            </p>
          </div>
          <div className="border-muted border-l-2 pl-6">
            <h3 className="mb-1 font-medium text-foreground">
              Group Exhibition
            </h3>
            <p className="mb-2 text-muted-foreground">
              Museum of Latin American Art, Los Angeles (2021)
            </p>
            <p className="text-muted-foreground text-sm">
              "Voices from the Amazon: Contemporary Indigenous Artists"
            </p>
          </div>
          <div className="border-muted border-l-2 pl-6">
            <h3 className="mb-1 font-medium text-foreground">
              International Fair
            </h3>
            <p className="mb-2 text-muted-foreground">
              Art Basel Miami Beach (2020)
            </p>
            <p className="text-muted-foreground text-sm">
              Represented by Galería La Cometa
            </p>
          </div>
        </div>
        <Button variant="outline" className="mt-6 gap-2 bg-transparent">
          View All Exhibitions
          <ExternalLink className="h-4 w-4" />
        </Button>
      </section>

      {/* Artist Statement */}
      <section>
        <h2 className="mb-6 font-light text-2xl text-foreground">
          Artist Statement
        </h2>
        <blockquote className="border-primary border-l-4 pl-6 text-lg text-muted-foreground italic leading-relaxed">
          "My paintings are not just images; they are vessels of memory,
          carriers of ancestral knowledge, and bridges between the spiritual and
          material worlds. Through color and form, I seek to preserve and share
          the wisdom of my people while creating new dialogues in contemporary
          art."
        </blockquote>
        <p className="mt-4 text-right text-muted-foreground text-sm">
          — Carlos Jacanamijoy
        </p>
      </section>
    </div>
  );
}
