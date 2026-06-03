"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckCircleIcon,
  InfoIcon,
  AlertIcon,
  AlertSquareIcon,
  LoadingIcon,
} from "@/lib/icons";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <HugeiconsIcon icon={CheckCircleIcon} className="size-4" />,
        info: <HugeiconsIcon icon={InfoIcon} className="size-4" />,
        warning: <HugeiconsIcon icon={AlertIcon} className="size-4" />,
        error: <HugeiconsIcon icon={AlertSquareIcon} className="size-4" />,
        loading: (
          <HugeiconsIcon icon={LoadingIcon} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
