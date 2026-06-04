"use client";

import { Button } from "@/components/ui/button";
import {
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
import { navMenu, type INavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Flatten a nav tree into a list of leaf items with a url */
function flattenNav(items: INavItem[]): INavItem[] {
  return items.flatMap((item) => {
    if (item.items && item.items.length > 0) return flattenNav(item.items);
    if (item.url) return [item];
    return [];
  });
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

  const handleNavigate = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground w-48 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={SearchIcon} className="h-3.5 w-3.5" />
          <span className="text-sm">Rechercher...</span>
        </span>
        <Kbd>{isMac ? "⌘K" : "Ctrl+K"}</Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {navMenu.map((group, gi) => {
            const leaves = flattenNav(group.items ? [group] : [group]);
            const groupItems = group.items
              ? group.items.flatMap((item) =>
                  item.items
                    ? item.items.filter((s) => s.url)
                    : item.url
                      ? [item]
                      : [],
                )
              : group.url
                ? [group]
                : [];

            if (groupItems.length === 0) return null;

            return (
              <div key={group.title}>
                {gi > 0 && <CommandSeparator />}
                <CommandGroup heading={group.items ? group.title : undefined}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.url}
                      onSelect={() => handleNavigate(item.url!)}
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
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
