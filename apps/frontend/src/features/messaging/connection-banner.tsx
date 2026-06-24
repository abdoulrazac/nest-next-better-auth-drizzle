"use client";

import { Icon } from "@/components/ui/icon";
import { AlertCircleIcon, CheckCircleIcon, SpinnerIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "./use-chat-socket";

interface Config {
  icon: React.ReactNode;
  message: string;
  className: string;
}

function getConfig(status: ConnectionStatus): Config | null {
  switch (status) {
    case "connecting":
      return {
        icon: (
          <Icon
            icon={SpinnerIcon}
            size={13}
            className="animate-spin shrink-0"
          />
        ),
        message: "Connexion à la messagerie…",
        className: "bg-muted/80 text-muted-foreground border-border/60",
      };
    case "reconnecting":
      return {
        icon: (
          <Icon
            icon={SpinnerIcon}
            size={13}
            className="animate-spin shrink-0"
          />
        ),
        message: "Reconnexion en cours…",
        className:
          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
      };
    case "disconnected":
      return {
        icon: <Icon icon={AlertCircleIcon} size={13} className="shrink-0" />,
        message: "Connexion perdue. Rechargez la page pour réessayer.",
        className:
          "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
      };
    case "reconnected":
      return {
        icon: <Icon icon={CheckCircleIcon} size={13} className="shrink-0" />,
        message: "Connexion rétablie",
        className:
          "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/50",
      };
    default:
      return null;
  }
}

interface Props {
  status: ConnectionStatus;
}

export function ConnectionBanner({ status }: Props) {
  const config = getConfig(status);

  if (!config) return null;

  return (
    <div
      className={cn(
        // Layout
        "flex items-center justify-center gap-1.5",
        // Sizing — slim horizontal bar
        "w-full px-3 py-1.5",
        // Typography
        "text-xs font-medium",
        // Border bottom only — blends into the chat area
        "border-b",
        // Smooth in/out
        "transition-all duration-300",
        config.className,
      )}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      <span>{config.message}</span>
    </div>
  );
}
