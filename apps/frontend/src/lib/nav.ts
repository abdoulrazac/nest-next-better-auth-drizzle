import type { IconSvgElement } from "@hugeicons/react";
import {
  HomeIcon,
  UsersIcon,
  ShieldUserIcon,
  DocumentIcon,
  SettingsIcon,
} from "@/lib/icons";

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
    title: "Paramètres",
    icon: SettingsIcon,
    color: "text-purple-600",
    items: [
      { title: "Général", url: "/settings/general" },
      { title: "Données entreprise", url: "/settings/company" },
      { title: "Exercices fiscaux", url: "/settings/fiscal-years" },
      { title: "Numérotation", url: "/settings/numbering" },
      { title: "Sauvegarde", url: "/settings/backup" },
      { title: "Données", url: "/settings/data" },
      { title: "Relances", url: "/settings/reminders" },
      { title: "Abonnement", url: "/settings/subscription" },
      { title: "Certification DGI", url: "/settings/dgi-integration" },
      { title: "Développeurs", url: "/settings/developers" },
    ],
  },
];
