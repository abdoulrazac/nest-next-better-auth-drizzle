"use client";

import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { CopyIcon, CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ─── DetailField ──────────────────────────────────────────────────────────────

interface DetailFieldProps {
  label: string;
  value?: React.ReactNode;
  isLoading?: boolean;
  mono?: boolean;
  className?: string;
  copyable?: boolean;
}

export function DetailField({
  label,
  value,
  isLoading = false,
  mono = false,
  className,
  copyable = false,
}: DetailFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value == null) return;
    await navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="h-5 w-3/4" />
      ) : (
        <div className="flex items-center gap-1.5">
          <span
            className={cn("text-sm font-medium", mono && "font-mono text-xs")}
          >
            {value ?? <span className="text-muted-foreground">—</span>}
          </span>
          {copyable && value != null && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Icon icon={CheckIcon} size={12} />
              ) : (
                <Icon icon={CopyIcon} size={12} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DetailGrid ───────────────────────────────────────────────────────────────

interface DetailGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

const colsMap: Record<1 | 2 | 3, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

export function DetailGrid({ children, cols = 2, className }: DetailGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", colsMap[cols], className)}>
      {children}
    </div>
  );
}

// ─── DetailSection ────────────────────────────────────────────────────────────

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={className}>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      {children}
    </div>
  );
}
