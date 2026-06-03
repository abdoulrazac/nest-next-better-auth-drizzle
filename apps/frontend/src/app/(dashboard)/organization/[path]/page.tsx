"use client";

import { OrganizationPeople } from "@/components/auth/organization/organization-people";
import { OrganizationSettings } from "@/components/auth/organization/organization-settings";
import { BasePage } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, redirect } from "next/navigation";

const VALID_PATHS = ["settings", "people"] as const;
type OrgPath = (typeof VALID_PATHS)[number];

const TABS = [
  { value: "settings", label: "Paramètres", href: "/organization/settings" },
  { value: "people", label: "Membres", href: "/organization/people" },
] as const;

export function generateStaticParams() {
  return VALID_PATHS.map((path) => ({ path }));
}

export default function OrganizationPage() {
  const { path } = useParams<{ path: string }>();

  if (!VALID_PATHS.includes(path as OrgPath)) {
    redirect("/organization/settings");
  }

  return (
    <BasePage
      breadcrumbs={[{ title: "Organisation", url: "/organization/settings" }]}
    >
      <div className="space-y-4">
        <Tabs value={path} className="w-full">
          <TabsList className="w-fit justify-start">
            {TABS.map((tab) => (
              <TabsTrigger
                asChild
                key={tab.value}
                value={tab.value}
                className="px-4"
              >
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {path === "settings" && <OrganizationSettings />}
        {path === "people" && <OrganizationPeople />}
      </div>
    </BasePage>
  );
}
