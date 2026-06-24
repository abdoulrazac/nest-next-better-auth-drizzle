import {
  HugeiconsIcon,
  type HugeiconsProps,
  type IconSvgElement,
} from "@hugeicons/react";

export interface IconProps extends Omit<HugeiconsProps, "icon"> {
  icon: IconSvgElement;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Wrapper around Icon with sensible defaults.
 *
 * Usage:
 *   import { Icon } from "@/components/ui/icon"
 *   import { SearchIcon } from "@/lib/icons"
 *   <Icon icon={SearchIcon} size={16} />
 */
export function Icon({
  icon,
  size = 16,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      {...props}
    />
  );
}
