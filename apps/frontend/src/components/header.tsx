"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LaptopIcon, MoonIcon, SunIcon } from "@/lib/icons";
import { useTheme } from "next-themes";
import { NavUser } from "./nav-user";

export function Header() {
  const { setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6 mr-2" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HugeiconsIcon
                icon={SunIcon}
                className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <HugeiconsIcon
                icon={MoonIcon}
                className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span className="sr-only">Changer le thème</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <HugeiconsIcon icon={SunIcon} className="mr-2 h-4 w-4" />
              Clair
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <HugeiconsIcon icon={LaptopIcon} className="mr-2 h-4 w-4" />
              Système
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <HugeiconsIcon icon={MoonIcon} className="mr-2 h-4 w-4" />
              Sombre
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <NavUser />
      </div>
    </header>
  );
}
