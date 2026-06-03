"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useTheme } from "next-themes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoonIcon, SunIcon } from "@/lib/icons";
import { CommandMenu } from "./command-menu";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Crumb {
  title: string;
  url?: string;
}

interface BasePageProps {
  breadcrumbs?: Crumb[];
  children: ReactNode;
  className?: string;
  /** "compact" réduit le padding du contenu */
  variant?: "default" | "compact";
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Changer le thème"
    >
      <HugeiconsIcon
        icon={SunIcon}
        className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <HugeiconsIcon
        icon={MoonIcon}
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
}

export function BasePage({
  breadcrumbs,
  children,
  className,
  variant = "default",
}: BasePageProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        {/* Gauche : trigger + breadcrumbs */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => (
                    <Fragment key={crumb.url ?? crumb.title}>
                      <BreadcrumbItem>
                        {crumb.url && i < breadcrumbs.length - 1 ? (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.url}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          )}
        </div>

        {/* Droite : CommandMenu + ThemeToggle */}
        <div className="ml-auto flex items-center gap-2">
          <CommandMenu />
          <ThemeToggle />
        </div>
      </header>

      {/* Contenu */}
      <main
        className={cn(
          "mx-auto w-full max-w-6xl 2xl:max-w-7xl",
          variant === "compact" ? "p-4 mt-4" : "p-4 pt-0 mt-6",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default BasePage;
