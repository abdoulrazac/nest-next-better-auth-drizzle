"use client";

import PageHeader from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ApiKeysTab } from "./_components/api-keys-tab";
import { WebhooksTab } from "./_components/webhooks-tab";

const tabs = [
  { value: "api-keys", label: "Clés API", icon: Key01Icon },
  { value: "webhooks", label: "Webhooks", icon: Link01Icon },
];

export default function DevelopersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Développeurs"
        description="Gérer vos clés API et webhooks"
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
              <HugeiconsIcon icon={tab.icon} className="mr-1" />
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
