// @ts-nocheck
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORDERED_PLANS,
  PLAN_FEATURES,
  PLAN_LIMITS,
  PLAN_NAMES,
  PLAN_PRICES_ANNUAL,
  PLAN_PRICES_MONTHLY,
  type PlanId,
} from "@/lib/plans";
import { formatXOF } from "@/lib/format";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircleIcon, ChevronRightIcon, CrownIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  ACTIVE: {
    label: "Actif",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  PAST_DUE: {
    label: "En retard",
    class: "bg-amber-100 text-amber-700 border-amber-200",
  },
  CANCELLED: {
    label: "Résilié",
    class: "bg-red-100 text-red-700 border-red-200",
  },
  TRIAL: { label: "Essai", class: "bg-blue-100 text-blue-700 border-blue-200" },
};

interface SubscriptionData {
  plan: string;
  status: string;
  billingCycle?: string;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd?: boolean;
}

interface Props {
  data: SubscriptionData;
  onUpgrade: (plan: PlanId) => void;
}

export function SubscriptionPlanCard({ data, onUpgrade }: Props) {
  const plan = data.plan as PlanId;
  const limits = PLAN_LIMITS[plan];
  const statusBadge = STATUS_BADGE[data.status] ?? STATUS_BADGE.ACTIVE!;

  const price =
    plan === "FREE"
      ? 0
      : data.billingCycle === "ANNUAL"
        ? PLAN_PRICES_ANNUAL[plan]
        : PLAN_PRICES_MONTHLY[plan];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon
              icon={CrownIcon}
              className={cn(
                "h-5 w-5",
                plan === "FREE" ? "text-slate-400" : "text-amber-500",
              )}
            />
            {PLAN_NAMES[plan]}
          </CardTitle>
          <Badge className={cn("text-xs border", statusBadge.class)}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prix */}
        <div>
          <p className="text-3xl font-black text-foreground">
            {plan === "FREE" ? "Gratuit" : formatXOF(price)}
          </p>
          {plan !== "FREE" && (
            <p className="text-xs text-muted-foreground">
              /{data.billingCycle === "ANNUAL" ? "an" : "mois"}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Période en cours</span>
            <span className="font-medium text-foreground">
              {format(new Date(data.currentPeriodStart), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prochaine échéance</span>
            <span className="font-medium text-foreground">
              {format(new Date(data.currentPeriodEnd), "dd/MM/yyyy")}
            </span>
          </div>
          {data.cancelAtPeriodEnd && (
            <p className="text-amber-600 font-medium">
              ⚠ Résiliation programmée en fin de période
            </p>
          )}
        </div>

        {/* Fonctionnalités incluses */}
        <ul className="space-y-1.5">
          {PLAN_FEATURES[plan].map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <Icon
                icon={CheckCircleIcon}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
              />
              {f}
            </li>
          ))}
        </ul>

        {/* Bouton upgrade */}
        {(() => {
          const nextPlan = ORDERED_PLANS[ORDERED_PLANS.indexOf(plan) + 1] as
            | PlanId
            | undefined;
          if (!nextPlan || plan !== "FREE") return null;
          return (
            <Button
              className="w-full"
              size="sm"
              onClick={() => onUpgrade(nextPlan)}
            >
              Passer au plan {PLAN_NAMES[nextPlan]?.split("—")[0]?.trim()}
              <Icon icon={ChevronRightIcon} className="ml-1 h-3.5 w-3.5" />
            </Button>
          );
        })()}
      </CardContent>
    </Card>
  );
}
