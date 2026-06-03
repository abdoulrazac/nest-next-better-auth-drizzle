"use client";

import { cn } from "@/lib/utils";
import {
  AlarmClockIcon,
  Building,
  Calendar03Icon,
  Code,
  DashboardSquare02Icon,
  DatabaseSyncIcon,
  FileDatabaseIcon,
  InputNumericIcon,
  MoneyBag02Icon,
  Refresh,
  Settings,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Settings;
  description?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const settingsNavGroups: NavGroup[] = [
  {
    title: "Aperçu",
    items: [
      {
        label: "Vue d'ensemble",
        href: "/settings",
        icon: DashboardSquare02Icon,
        description: "Tableau de bord des paramètres",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "Général",
        href: "/settings/general",
        icon: Settings,
        description: "Préférences générales",
      },
      {
        label: "Entreprise",
        href: "/settings/company",
        icon: Building,
        description: "Informations légales",
      },
      {
        label: "Numérotation",
        href: "/settings/numbering",
        icon: InputNumericIcon,
        description: "Préférences de numérotation",
      },
      {
        label: "Relances",
        href: "/settings/reminders",
        icon: AlarmClockIcon,
        description: "Rappels de paiement",
      },
      {
        label: "Exercices fiscaux",
        href: "/settings/fiscal-years",
        icon: Calendar03Icon,
        description: "Gestion des exercices fiscaux",
      },
      // {
      //   label: "Templates",
      //   href: "/settings/templates",
      //   icon: FileEditIcon,
      //   description: "Modèles de documents",
      // },
    ],
  },
  {
    title: "Données",
    items: [
      {
        label: "Gestion des données",
        href: "/settings/data",
        icon: FileDatabaseIcon,
        description: "Import/Export de données",
      },
      {
        label: "Sauvegarde",
        href: "/settings/backup",
        icon: Refresh,
        description: "Sauvegardes automatiques",
      },
    ],
  },
  {
    title: "Avancé",
    items: [
      {
        label: "Abonnement",
        href: "/settings/subscription",
        icon: MoneyBag02Icon,
        description: "Plan et facturation",
      },
      {
        label: "Développeurs",
        href: "/settings/developers",
        icon: Code,
        description: "API et webhooks",
      },
      {
        label: "Certification DGI",
        href: "/settings/dgi-integration",
        icon: DatabaseSyncIcon,
        description: "Connexion aux services fiscaux",
      },
    ],
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/settings") {
      return pathname === "/settings";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="w-50 shrink-0 space-y-6">
      {settingsNavGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </h3>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={18}
                    className={cn(
                      isActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
