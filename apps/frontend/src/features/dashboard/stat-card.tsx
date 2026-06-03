"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon, type IconProps } from "@/components/ui/icon";
import { ArrowUpIcon, ArrowDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconProps["icon"];
  description?: string;
  trend?: { value: number; direction: "up" | "down" };
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  isLoading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && !isLoading && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.direction === "up"
                    ? "text-emerald-600"
                    : "text-red-500",
                )}
              >
                <Icon
                  icon={trend.direction === "up" ? ArrowUpIcon : ArrowDownIcon}
                  size={12}
                  strokeWidth={2}
                />
                {trend.value}%
              </div>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2">
            <Icon icon={icon} size={20} strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
