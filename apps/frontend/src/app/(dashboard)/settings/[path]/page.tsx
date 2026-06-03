"use client";

import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings";
import { BasePage } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { viewPaths } from "@better-auth-ui/core";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";

const VALID_PATHS = [
  viewPaths.settings.account,
  viewPaths.settings.security,
  "organizations",
] as const;

type SettingsPath = (typeof VALID_PATHS)[number];

const TABS = [
  {
    value: viewPaths.settings.account,
    label: "Mon compte",
    href: `/settings/${viewPaths.settings.account}`,
  },
  {
    value: viewPaths.settings.security,
    label: "Sécurité",
    href: `/settings/${viewPaths.settings.security}`,
  },
  {
    value: "organizations",
    label: "Organisations",
    href: "/settings/organizations",
  },
] as const;

export function generateStaticParams() {
  return VALID_PATHS.map((path) => ({ path }));
}

export default function UserSettingsPage() {
  const { path } = useParams<{ path: string }>();

  if (!VALID_PATHS.includes(path as SettingsPath)) {
    redirect(`/settings/${viewPaths.settings.account}`);
  }

  return (
    <BasePage
      breadcrumbs={[
        { title: "Mon compte", url: `/settings/${viewPaths.settings.account}` },
      ]}
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

        {path === viewPaths.settings.account && (
          <div className="text-muted-foreground text-sm">
            {/* TODO: AccountSettings component */}
            Paramètres du compte utilisateur
          </div>
        )}

        {path === viewPaths.settings.security && (
          <div className="text-muted-foreground text-sm">
            {/* TODO: SecuritySettings component (password, sessions) */}
            Paramètres de sécurité
          </div>
        )}

        {path === "organizations" && <OrganizationsSettings />}
      </div>
    </BasePage>
  );
}
