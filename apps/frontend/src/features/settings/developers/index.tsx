"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { KeyIcon, LinkIcon } from "@/lib/icons";
import PageHeader from "@/components/page-header";
import { ApiKeysTab } from "./api-keys-tab";
import { WebhooksTab } from "./webhooks-tab";

const tabs = [
  { value: "api-keys", label: "Clés API", icon: KeyIcon },
  { value: "webhooks", label: "Webhooks", icon: LinkIcon },
] as const;

export function DevelopersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Développeurs"
        description="Gérez vos clés API et webhooks"
        variant="list"
      />

      <Tabs defaultValue="api-keys" className="w-full space-y-4">
        <TabsList variant="line" className="flex w-full justify-start border-b">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="max-w-30 px-4 data-active:text-primary"
            >
              <Icon icon={tab.icon} size={16} className="mr-1" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ApiKeysTab />
        <WebhooksTab />
      </Tabs>
    </div>
  );
}
