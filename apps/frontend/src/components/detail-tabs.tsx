"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface TabItem {
  value: string;
  label: string;
  icon?: IconSvgElement;
  content: ReactNode;
  disabled?: boolean;
}

interface DetailTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export function DetailTabs({
  tabs,
  defaultValue,
  className,
  onChange,
}: DetailTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={onChange}
      className={className}
    >
      <TabsList
        className={cn("grid w-full", `grid-cols-${Math.min(tabs.length, 4)}`)}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.icon && <Icon icon={tab.icon} className="mr-1 h-4 w-4" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ── Tab factories ──────────────────────────────────────────────────────────────
export const createOverviewTab = (content: ReactNode): TabItem => ({
  value: "overview",
  label: "Vue d'ensemble",
  content,
});
export const createDetailsTab = (content: ReactNode): TabItem => ({
  value: "details",
  label: "Détails",
  content,
});
export const createHistoryTab = (content: ReactNode): TabItem => ({
  value: "history",
  label: "Historique",
  content,
});
export const createDocumentsTab = (content: ReactNode): TabItem => ({
  value: "documents",
  label: "Documents",
  content,
});
export const createPaymentsTab = (content: ReactNode): TabItem => ({
  value: "payments",
  label: "Paiements",
  content,
});
export const createOrdersTab = (content: ReactNode): TabItem => ({
  value: "orders",
  label: "Commandes",
  content,
});
export const createInvoicesTab = (content: ReactNode): TabItem => ({
  value: "invoices",
  label: "Factures",
  content,
});
export const createActivityTab = (content: ReactNode): TabItem => ({
  value: "activity",
  label: "Activité",
  content,
});
