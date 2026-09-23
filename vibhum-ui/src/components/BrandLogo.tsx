import { cn } from "@/lib/utils";

// Reusable Vibhum wordmark / logomark.
// Theme-aware by default. Pass `inverse` to force the light logo on a dark
// surface. Pass `mark` to render the square logo mark only (e.g. the collapsed
// sidebar). Height is controlled by the caller via className (e.g. "h-7").
export function BrandLogo({
  className,
  inverse = false,
  mark = false,
}: {
  className?: string;
  inverse?: boolean;
  mark?: boolean;
}) {
  if (mark) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/vibhum-mark.png" alt="Vibhum" className={cn("w-auto select-none", className)} />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/vibhum-mark.png" alt="Vibhum" className={cn("w-auto select-none", className)} />
      <span className={cn("font-bold tracking-tight text-xl", inverse ? "text-white" : "text-foreground")}>
        Vibhum
      </span>
    </div>
  );
}
