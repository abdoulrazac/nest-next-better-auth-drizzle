import {
  BellIcon,
  DashboardIcon,
  DocumentIcon,
  FileIcon,
  SettingsIcon,
  ShieldUserIcon,
  UsersIcon,
  WebhookIcon,
} from "@/lib/icons";
import type { IconSvgElement } from "@hugeicons/react";

export type NavLink = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
};

export type NavCollapsible = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
  items: NavLink[];
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function isNavCollapsible(item: NavItem): item is NavCollapsible {
  return "items" in item;
}

export const sidebarData: { navGroups: NavGroup[] } = {
  navGroups: [
    {
      title: "General",
      items: [{ title: "Dashboard", url: "/", icon: DashboardIcon }],
    },
    {
      title: "Account",
      items: [
        {
          title: "Users & Roles",
          url: "/account",
          icon: UsersIcon,
          items: [
            { title: "Users", url: "/account/users", icon: UsersIcon },
            { title: "Roles", url: "/account/roles", icon: ShieldUserIcon },
            {
              title: "Audit Logs",
              url: "/account/audit-logs",
              icon: DocumentIcon,
            },
          ],
        },
      ],
    },
    {
      title: "System",
      items: [
        { title: "Notifications", url: "/notifications", icon: BellIcon },
        { title: "Files", url: "/files", icon: FileIcon },
        { title: "Webhooks", url: "/webhooks", icon: WebhookIcon },
      ],
    },
    {
      title: "Other",
      items: [{ title: "Settings", url: "/settings", icon: SettingsIcon }],
    },
  ],
};
