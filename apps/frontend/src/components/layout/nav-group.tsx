"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ChevronRightIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  type NavGroup as NavGroupProps,
  type NavLink,
  type NavCollapsible,
  type NavItem,
  isNavCollapsible,
} from "./sidebar-data";

function checkIsActive(
  pathname: string,
  item: NavItem,
  mainNav = false,
): boolean {
  if (pathname === item.url) return true;
  if (pathname.split("?")[0] === item.url) return true;
  if (isNavCollapsible(item) && item.items.some((i) => i.url === pathname))
    return true;
  if (
    mainNav &&
    item.url !== "/" &&
    pathname.split("/")[1] === item.url?.split("/")[1]
  )
    return true;
  return false;
}

function NavBadge({ children }: { children: React.ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}

function SidebarMenuLink({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = checkIsActive(pathname, item);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <Icon icon={item.icon} size={16} strokeWidth={isActive ? 2 : 1.5} />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({ item }: { item: NavCollapsible }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = checkIsActive(pathname, item, true);
  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            {item.icon && (
              <Icon
                icon={item.icon}
                size={16}
                strokeWidth={isActive ? 2 : 1.5}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <Icon
              icon={ChevronRightIcon}
              size={16}
              className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((sub) => {
              const subActive = checkIsActive(pathname, sub);
              return (
                <SidebarMenuSubItem key={sub.url}>
                  <SidebarMenuSubButton asChild isActive={subActive}>
                    <Link href={sub.url} onClick={() => setOpenMobile(false)}>
                      {sub.icon && (
                        <Icon
                          icon={sub.icon}
                          size={14}
                          strokeWidth={subActive ? 2 : 1.5}
                        />
                      )}
                      <span>{sub.title}</span>
                      {sub.badge && <NavBadge>{sub.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({ item }: { item: NavCollapsible }) {
  const pathname = usePathname();
  const isActive = checkIsActive(pathname, item, true);
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            {item.icon && (
              <Icon
                icon={item.icon}
                size={16}
                strokeWidth={isActive ? 2 : 1.5}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <Icon icon={ChevronRightIcon} size={16} className="ms-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title}
            {item.badge ? ` (${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const subActive = checkIsActive(pathname, sub);
            return (
              <DropdownMenuItem key={sub.url} asChild>
                <Link
                  href={sub.url}
                  className={subActive ? "bg-secondary" : ""}
                >
                  {sub.icon && <Icon icon={sub.icon} size={14} />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge && (
                    <span className="ms-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!isNavCollapsible(item)) {
            return <SidebarMenuLink key={item.url} item={item} />;
          }
          if (state === "collapsed" && !isMobile) {
            return <SidebarMenuCollapsedDropdown key={item.url} item={item} />;
          }
          return <SidebarMenuCollapsible key={item.url} item={item} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
