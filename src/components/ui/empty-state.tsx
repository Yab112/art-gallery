import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

