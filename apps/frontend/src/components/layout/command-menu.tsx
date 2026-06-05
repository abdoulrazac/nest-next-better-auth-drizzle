"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { SearchIcon } from "@/lib/icons";
import { navMenu } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavigation = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="hidden md:flex w-fit items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={SearchIcon} className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Recherche</span>
        {isClient && <Kbd>{isMac ? "⌘ + K" : "Ctrl + K"}</Kbd>}
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="min-w-lg p-4 top-[15%]"
      >
        <Command>
          <CommandInput placeholder="Rechercher une page..." />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

            {navMenu.map((group) => {
              // top-level item with a url (e.g. Tableau de bord)
              const items = group.items
                ? group.items.filter((item) => item.url)
                : group.url
                  ? [group]
                  : [];

              if (items.length === 0) return null;

              return (
                <React.Fragment key={group.title}>
                  <CommandGroup heading={group.title}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.url}
                        onSelect={() => handleNavigation(item.url as string)}
                      >
                        {item.icon && (
                          <HugeiconsIcon
                            icon={item.icon}
                            className={cn(
                              "mr-2 h-4 w-4",
                              group.color,
                              item.color,
                            )}
                          />
                        )}
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </React.Fragment>
              );
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
