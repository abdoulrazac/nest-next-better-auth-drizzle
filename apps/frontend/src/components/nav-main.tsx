"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { INavItem } from "@/lib/nav";
import { ChevronRightIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function NavCollapsibleGroup({
  item,
  currentPath,
}: {
  item: INavItem;
  currentPath: string;
}) {
  const isChildActive =
    item.items?.some((s) => currentPath.startsWith(s.url ?? "___")) ?? false;
  const storageKey = `sidebar-open-${item.title}`;

  // SSR-safe: start with route-based default, read localStorage after mount
  const [isOpen, setIsOpen] = useState<boolean>(
    isChildActive || !!item.isActive,
  );

  useEffect(() => {
    try {
      const val = localStorage.getItem(storageKey);
      if (val !== null) setIsOpen(val === "true");
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    try {
      localStorage.setItem(storageKey, String(open));
    } catch {
      /* ignore */
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          className="group/collapsible"
          onOpenChange={handleOpenChange}
          open={isOpen}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton isActive={isChildActive} tooltip={item.title}>
                {item.icon && (
                  <HugeiconsIcon
                    className={cn(item.color)}
                    icon={item.icon}
                    size={14}
                  />
                )}
                <span>{item.title}</span>
                <HugeiconsIcon
                  className={cn(
                    "ml-auto transition-transform duration-200",
                    isOpen && "rotate-90",
                  )}
                  icon={ChevronRightIcon}
                  size={14}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={currentPath.startsWith(subItem.url ?? "___")}
                    >
                      <Link href={subItem.url || "#"}>
                        {subItem.icon && (
                          <HugeiconsIcon
                            className={cn(item.color, subItem.color)}
                            icon={subItem.icon}
                            size={14}
                          />
                        )}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavMain({ items }: { items: INavItem[] }) {
  const currentPath = usePathname();

  return (
    <>
      {items.map((item) => {
        if (item.isGroup) {
          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarMenu>
                {item.items?.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        subItem.url === "/"
                          ? currentPath === "/"
                          : currentPath.startsWith(subItem.url ?? "___")
                      }
                      tooltip={subItem.title}
                    >
                      <Link href={subItem.url || "#"}>
                        {subItem.icon && (
                          <HugeiconsIcon
                            className={cn(item.color, subItem.color)}
                            icon={subItem.icon}
                            size={14}
                          />
                        )}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          );
        }

        if (item.items) {
          return (
            <NavCollapsibleGroup
              currentPath={currentPath}
              item={item}
              key={item.title}
            />
          );
        }

        // Standalone item
        return (
          <SidebarGroup key={item.title}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.url === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(item.url ?? "___")
                  }
                  tooltip={item.title}
                >
                  <Link href={item.url || "#"}>
                    {item.icon && (
                      <HugeiconsIcon
                        className={cn(item.color)}
                        icon={item.icon}
                        size={14}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
