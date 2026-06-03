"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BasePage } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoneyBag02Icon,
  Scissor01Icon,
  TaxesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const settingTabs = [
    {
      value: "tva",
      label: "TVA",
      href: "/settings/tax-rates",
      icon: TaxesIcon,
    },
    {
      value: "specific-tax",
      label: "Taxes spécifiques",
      href: "/settings/specific-taxes",
      icon: MoneyBag02Icon,
    },
    {
      value: "psvb",
      label: "PSVB",
      href: "/settings/psvb-rates",
      icon: Scissor01Icon,
    },
  ] as const;

  const activeTab =
    settingTabs.find(
      (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
    )?.value ?? "tva";

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
