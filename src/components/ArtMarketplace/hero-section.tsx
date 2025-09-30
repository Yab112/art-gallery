import { SectionTitle } from "@/components/section-title";

interface SectionTitleHeroProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export function SectionTitleHero({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: SectionTitleHeroProps) {
  return (
    <section className="px-4 pt-16 pb-4">
      <div className="mx-auto max-w-7xl text-center">
        <SectionTitle title={title} subtitle={subtitle} className="mb-8" />
        <div className="mb-12 flex justify-center">
          {/* <Button
            variant="outline"
            size="lg"
            className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button> */}
        </div>
      </div>
    </section>
  );
}
