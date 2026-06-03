import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { LoadingIcon } from "@/lib/icons";

function Spinner({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={LoadingIcon}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
