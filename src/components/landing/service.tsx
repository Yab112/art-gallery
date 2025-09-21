import { SectionTitle } from "@/components/section-title";

const premiumServices = [
  {
    img: "/art_advisory.png",
    title: "Art Advisory",
    description: "Artalistic guides you in your search.",
  },
  {
    img: "/offres_a_saisir.png",
    title: "Unbeatable Deals",
    description: "Let yourself be tempted by our offers.",
  },
  {
    img: "/leasing_oeuvres_art_eng.png",
    title: "Artwork Leasing",
    description: "Bring art into your business.",
  },
];

export function PremiumService() {
  return (
    <section className=" px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title="ARTALISTIC PREMIUM"
          subtitle="Our personalized services"
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {premiumServices.map((service) => (
            <div key={service.title}>
              <img src={service.img} alt={service.title} className="h-full" />

              <div className="relative mt-2 flex flex-col items-center justify-center text-muted-foreground">
                <h3 className=" text-sm">{service.title}</h3>
                <p className="text-sm ">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
