import {
  BellIcon,
  BriefcaseIcon,
  DashboardIcon,
  DocumentIcon,
  FileIcon,
  SettingsIcon,
  ShieldUserIcon,
  TagIcon,
  UsersIcon,
  WebhookIcon,
} from "@/lib/icons";
import type { IconSvgElement } from "@hugeicons/react";

export type NavLink = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
  addUrl?: string;
};

export type NavCollapsible = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
  items: NavLink[];
  color?: string;
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
      title: "Général",
      items: [{ title: "Tableau de bord", url: "/", icon: DashboardIcon }],
    },
    {
      title: "Comptes",
      items: [
        {
          title: "Utilisateurs & Rôles",
          url: "/account",
          icon: UsersIcon,
          color: "orange",
          items: [
            { title: "Utilisateurs", url: "/account/users", icon: UsersIcon },
            { title: "Rôles", url: "/account/roles", icon: ShieldUserIcon },
            {
              title: "Journaux d'audit",
              url: "/account/audit-logs",
              icon: DocumentIcon,
            },
          ],
        },
      ],
    },
    {
      title: "Système",
      items: [
        { title: "Notifications", url: "/notifications", icon: BellIcon },
        { title: "Fichiers", url: "/files", icon: FileIcon },
        { title: "Webhooks", url: "/webhooks", icon: WebhookIcon },
      ],
    },
    {
      title: "Showcase",
      items: [
        {
          title: "Produits",
          url: "/showcase/products",
          icon: BriefcaseIcon,
        },
      ],
    },
    {
      title: "Paramètres",
      items: [
        {
          title: "Configuration",
          url: "/settings",
          icon: SettingsIcon,
          color: "purple",
          items: [
            { title: "Général", url: "/settings/general", icon: SettingsIcon },
            {
              title: "Modèles",
              url: "/settings/templates",
              icon: DocumentIcon,
            },
            { title: "Unités", url: "/settings/units", icon: TagIcon },
          ],
        },
      ],
    },
  ],
};
