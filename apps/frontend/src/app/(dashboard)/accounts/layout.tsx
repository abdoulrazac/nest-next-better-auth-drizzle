"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BasePage } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GroupItemsIcon,
  TransactionHistoryIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const settingTabs = [
    {
      value: "users",
      label: "Utilisateurs",
      href: "/accounts/users",
      icon: UserMultipleIcon,
    },
    {
      value: "roles",
      label: "Rôles",
      href: "/accounts/roles",
      icon: GroupItemsIcon,
    },
    {
      value: "audit",
      label: "Journal d'audit",
      href: "/accounts/audits",
      icon: TransactionHistoryIcon,
    },
  ] as const;

  const activeTab =
    settingTabs.find(
      (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
    )?.value ?? "users";

  return (
    <BasePage breadcrumbs={[{ title: "Comptes", url: "/accounts/users" }]}>
      <div className="space-y-4">
        <Tabs className="w-full" value={activeTab}>
          <TabsList
            className="w-fit justify-start"
            // variant="line"
          >
            {settingTabs.map((tab) => (
              <TabsTrigger
                asChild
                key={tab.value}
                value={tab.value}
                className="px-4"
              >
                <Link href={tab.href}>
                  <HugeiconsIcon icon={tab.icon} className="mr-1" />
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {children}
      </div>
    </BasePage>
  );
}
