"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { navMenu } from "@/lib/nav";
import { NavMain } from "./nav-main";
import type React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-4 py-4">
        {open ? (
          <span className="text-sm font-semibold tracking-tight">
            Enterprise App
          </span>
        ) : (
          <span className="text-xs font-bold text-primary">EA</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMenu} />
      </SidebarContent>
    </Sidebar>
  );
}
