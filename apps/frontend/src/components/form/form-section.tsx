"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
  isLoading?: boolean;
  skeletonRows?: number;
}

export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
  footer,
  isLoading = false,
  skeletonRows = 3,
}: FormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={contentClassName}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <>
          <Separator />
          <div className="px-6 py-4">{footer}</div>
        </>
      )}
    </Card>
  );
}
