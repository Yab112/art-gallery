interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-center gap-8 ${className}`}>
      <div className="h-[2px] max-w-24 flex-1 bg-red-700" />

      {/* Title content */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-black tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-gray-600 text-sm italic">{subtitle}</p>
        )}
      </div>

      <div className="h-[2px] max-w-24 flex-1 bg-red-700" />
    </div>
  );
}
