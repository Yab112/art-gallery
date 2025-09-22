"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Calendar, Award, Users, Palette } from "lucide-react"

export function AboutSection() {
  return (
    <div className="max-w-4xl space-y-12">
      {/* Artist Biography */}
      <section>
        <h2 className="text-2xl font-light mb-6 text-foreground">Biography</h2>
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="leading-relaxed mb-4">
            Carlos Jacanamijoy depicts vivid, colour-saturated and abstract landscapes that emphasise the respect for
            heritage, memory and environment that he was taught as a Colombian indigenous of the Inga people. While his
            paintings are made abiding by the traditional techniques of his ancestors, they also incorporate
            contemporary artistic practices and materials.
          </p>
          <p className="leading-relaxed mb-4">
            Born in 1964 in Santiago, Putumayo, Colombia, Jacanamijoy's work is deeply rooted in his indigenous heritage
            and the natural landscapes of the Amazon rainforest. His paintings serve as a bridge between ancient wisdom
            and contemporary artistic expression, creating a unique visual language that speaks to both cultural
            preservation and artistic innovation.
          </p>
          <p className="leading-relaxed">
            His vibrant canvases often feature swirling forms and organic shapes that evoke the movement of water, wind,
            and the spiritual energy of the natural world. Through his art, Jacanamijoy invites viewers to experience
            the profound connection between humanity and nature that is central to Inga cosmology.
          </p>
        </div>
      </section>

      {/* Key Information */}
      <section>
        <h2 className="text-2xl font-light mb-6 text-foreground">Artist Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Born</p>
                <p className="text-muted-foreground">Santiago, Putumayo, Colombia (1964)</p>
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
                <p className="text-muted-foreground">International Contemporary Art</p>
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
        <h2 className="text-2xl font-light mb-6 text-foreground">Selected Exhibitions</h2>
        <div className="space-y-6">
          <div className="border-l-2 border-primary pl-6">
            <h3 className="font-medium text-foreground mb-1">Solo Exhibition</h3>
            <p className="text-muted-foreground mb-2">Galería El Museo, Bogotá, Colombia (2022)</p>
            <p className="text-sm text-muted-foreground">
              "Ancestral Visions: Contemporary Expressions of Indigenous Memory"
            </p>
          </div>
          <div className="border-l-2 border-muted pl-6">
            <h3 className="font-medium text-foreground mb-1">Group Exhibition</h3>
            <p className="text-muted-foreground mb-2">Museum of Latin American Art, Los Angeles (2021)</p>
            <p className="text-sm text-muted-foreground">"Voices from the Amazon: Contemporary Indigenous Artists"</p>
          </div>
          <div className="border-l-2 border-muted pl-6">
            <h3 className="font-medium text-foreground mb-1">International Fair</h3>
            <p className="text-muted-foreground mb-2">Art Basel Miami Beach (2020)</p>
            <p className="text-sm text-muted-foreground">Represented by Galería La Cometa</p>
          </div>
        </div>
        <Button variant="outline" className="mt-6 gap-2 bg-transparent">
          View All Exhibitions
          <ExternalLink className="h-4 w-4" />
        </Button>
      </section>

      {/* Artist Statement */}
      <section>
        <h2 className="text-2xl font-light mb-6 text-foreground">Artist Statement</h2>
        <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-muted-foreground leading-relaxed">
          "My paintings are not just images; they are vessels of memory, carriers of ancestral knowledge, and bridges
          between the spiritual and material worlds. Through color and form, I seek to preserve and share the wisdom of
          my people while creating new dialogues in contemporary art."
        </blockquote>
        <p className="text-right text-sm text-muted-foreground mt-4">— Carlos Jacanamijoy</p>
      </section>
    </div>
  )
}
