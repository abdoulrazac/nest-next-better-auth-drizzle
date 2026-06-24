"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Icon } from "@/components/ui/icon";
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
        success: <Icon icon={CheckCircleIcon} className="size-4" />,
        info: <Icon icon={InfoIcon} className="size-4" />,
        warning: <Icon icon={AlertIcon} className="size-4" />,
        error: <Icon icon={AlertSquareIcon} className="size-4" />,
        loading: <Icon icon={LoadingIcon} className="size-4 animate-spin" />,
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
