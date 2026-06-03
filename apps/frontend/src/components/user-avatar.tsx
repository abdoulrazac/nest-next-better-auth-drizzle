"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COLOR_PALETTE = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "?";
}

function getColorClass(name?: string | null): string {
  if (!name || name.length < 2) return COLOR_PALETTE[0]!;
  const index = (name.charCodeAt(0) + name.charCodeAt(1)) % 8;
  return COLOR_PALETTE[index] ?? COLOR_PALETTE[0]!;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-xs",
  default: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  email,
  imageUrl,
  size = "default",
  showTooltip = false,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, email);
  const colorClass = getColorClass(name);
  const sizeClass = SIZE_CLASSES[size];

  const avatar = (
    <Avatar className={cn(sizeClass, className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name ?? email ?? "User"} />}
      <AvatarFallback className={cn(colorClass, "text-white")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatar;

  const tooltipLabel = name ?? email;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        {tooltipLabel && <TooltipContent>{tooltipLabel}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
