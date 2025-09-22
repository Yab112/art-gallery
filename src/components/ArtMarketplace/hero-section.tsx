"use client";

import { Button } from "@/components/ui/button";
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
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <SectionTitle title={title} subtitle={subtitle} className="mb-8" />
        <div className="flex justify-center mb-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
