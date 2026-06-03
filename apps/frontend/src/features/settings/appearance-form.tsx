"use client";

import { useTheme } from "next-themes";
import { Icon } from "@/components/ui/icon";
import { SunIcon, MoonIcon, ComputerIcon } from "@/lib/icons";

import { FormSection } from "@/components/form-section";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: ComputerIcon },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();

  return (
    <FormSection
      title="Theme"
      description="Choose how the interface looks for you."
    >
      <div className="flex gap-4">
        {themes.map(({ value, label, icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent",
                isActive
                  ? "border-primary bg-accent"
                  : "border-border bg-background",
              )}
            >
              <Icon
                icon={icon}
                size={24}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </FormSection>
  );
}
