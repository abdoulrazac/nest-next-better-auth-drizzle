import { LoadingIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

function Spinner({ className }: { className?: string }) {
  return (
    <Icon
      icon={LoadingIcon}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
