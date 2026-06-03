"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SearchIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isNavCollapsible, sidebarData } from "./sidebar-data";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground text-sm w-48 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={SearchIcon} className="h-3.5 w-3.5" />
          Rechercher...
        </span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-xs">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          {sidebarData.navGroups.map((group, gi) => (
            <div key={group.title}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.title}>
                {group.items.flatMap((item) => {
                  if (isNavCollapsible(item)) {
                    return item.items.map((sub) => (
                      <CommandItem
                        key={sub.url}
                        onSelect={() => navigate(sub.url)}
                      >
                        {sub.icon && (
                          <HugeiconsIcon
                            icon={sub.icon}
                            className="mr-2 h-4 w-4"
                          />
                        )}
                        {sub.title}
                      </CommandItem>
                    ));
                  }
                  return [
                    <CommandItem
                      key={item.url}
                      onSelect={() => navigate(item.url)}
                    >
                      {item.icon && (
                        <HugeiconsIcon
                          icon={item.icon}
                          className="mr-2 h-4 w-4"
                        />
                      )}
                      {item.title}
                    </CommandItem>,
                  ];
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
