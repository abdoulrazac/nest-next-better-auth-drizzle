import {
  DocumentIcon,
  HomeIcon,
  MessagesIcon,
  SettingsIcon,
  ShieldUserIcon,
  UsersIcon,
} from "@/lib/icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface INavItem {
  title: string;
  url?: string;
  icon?: IconSvgElement;
  color?: string;
  isActive?: boolean;
  isGroup?: boolean;
  items?: INavItem[];
  addUrl?: string;
}

export const navMenu: INavItem[] = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Messagerie",
    url: "/chat",
    icon: MessagesIcon,
    color: "text-indigo-600",
  },
  {
    title: "Cas d'exemple",
    icon: DocumentIcon,
    color: "text-green-600",
    items: [
      {
        title: "Produits",
        url: "/showcase/products",
        icon: DocumentIcon,
      },
    ],
  },
  {
    title: "Comptes",
    icon: UsersIcon,
    color: "text-blue-600",
    items: [
      {
        title: "Utilisateurs",
        url: "/accounts/users",
        icon: UsersIcon,
      },
      {
        title: "Rôles",
        url: "/accounts/roles",
        icon: ShieldUserIcon,
      },
      {
        title: "Journaux d'audit",
        url: "/accounts/audits",
        icon: DocumentIcon,
      },
    ],
  },
  {
    title: "Configuration",
    icon: SettingsIcon,
    color: "text-purple-600",
    items: [{ title: "Paramètres", url: "/settings" }],
  },
];
