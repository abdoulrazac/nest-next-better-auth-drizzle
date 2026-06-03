"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";

interface PageHeaderAction {
  label: string;
  icon?: IconSvgElement;
  onClick?: () => void;
  href?: string;
  asChild?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: PageHeaderAction;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  children,
}: PageHeaderProps) {
  const renderAction = () => {
    if (!action) return null;

    const buttonContent = (
      <>
        {action.icon && <Icon icon={action.icon} />}
        {action.label}
      </>
    );

    if (action.href) {
      return (
        <Button asChild onClick={action.onClick}>
          <Link href={action.href}>{buttonContent}</Link>
        </Button>
      );
    }

    return <Button onClick={action.onClick}>{buttonContent}</Button>;
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children ? children : renderAction()}
    </div>
  );
}
