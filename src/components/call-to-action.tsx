import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export function CallToAction({
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
}: CallToActionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <SectionTitle title={title} subtitle={subtitle} className="mb-8" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-black text-white px-8 py-3 hover:bg-gray-800"
            onClick={onSecondaryClick}
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
