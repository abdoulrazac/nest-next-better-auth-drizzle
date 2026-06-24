"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LaptopIcon, MoonIcon, SunIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { NavUser } from "../nav-user";
import { CommandMenu } from "./command-menu";

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
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Changer le thème"
        >
          <Icon
            icon={SunIcon}
            className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon={MoonIcon}
            className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Icon icon={SunIcon} className="mr-2 h-4 w-4" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Icon icon={LaptopIcon} className="mr-2 h-4 w-4" />
          Système
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Icon icon={MoonIcon} className="mr-2 h-4 w-4" />
          Sombre
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

        {/* Droite : CommandMenu + ThemeToggle + NavUser */}
        <div className="ml-auto flex items-center gap-2">
          <CommandMenu />
          <ThemeToggle />
          <NavUser />
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
