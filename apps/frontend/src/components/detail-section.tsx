"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface DetailItemProps {
  label: string;
  value?: ReactNode;
  className?: string;
}
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function DetailSection({
  title,
  description,
  action,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

interface DetailGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}
export function DetailGrid({
  columns = 2,
  children,
  className,
}: DetailGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns];
  return (
    <div className={cn("grid gap-4", colClass, className)}>{children}</div>
  );
}

interface DetailCardProps {
  title: string;
  items: { label: string; value?: ReactNode }[];
  columns?: 1 | 2;
  className?: string;
}
export function DetailCard({
  title,
  items,
  columns = 2,
  className,
}: DetailCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <h4 className="text-sm font-semibold">{title}</h4>
      <DetailGrid columns={columns}>
        {items.map((item, i) => (
          <DetailItem key={i} label={item.label} value={item.value} />
        ))}
      </DetailGrid>
    </div>
  );
}

interface DetailSummaryItem {
  label: string;
  value: ReactNode;
  variant?: "default" | "success" | "destructive";
}
interface DetailSummaryProps {
  title?: string;
  items: DetailSummaryItem[];
  className?: string;
}
export function DetailSummary({ title, items, className }: DetailSummaryProps) {
  return (
    <div className={cn("rounded-lg bg-muted/50 p-4 space-y-2", className)}>
      {title && <h4 className="text-sm font-semibold">{title}</h4>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground min-w-32">{item.label}</span>
          <span
            className={cn(
              "font-medium",
              item.variant === "success" && "text-emerald-600",
              item.variant === "destructive" && "text-destructive",
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
