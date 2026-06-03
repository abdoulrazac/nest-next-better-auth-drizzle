// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
  ORDERED_PLANS,
  PLAN_FEATURES,
  PLAN_NAMES,
  PLAN_PRICES_ANNUAL,
  PLAN_PRICES_MONTHLY,
  type PlanId,
} from "@/lib/plans";
import { cn } from "@/lib/utils";
import { formatXOF } from "@/lib/format";
import { CheckCircle, ChevronRight } from "lucide-react";

interface Props {
  currentPlan: PlanId;
  billingCycle: "MONTHLY" | "ANNUAL";
  onUpgrade: (p: PlanId) => void;
}

export function SubscriptionPlanSelector({
  currentPlan,
  billingCycle,
  onUpgrade,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {ORDERED_PLANS.map((p) => {
        const isCurrent = p === currentPlan;
        const isDown =
          ORDERED_PLANS.indexOf(p) < ORDERED_PLANS.indexOf(currentPlan);
        const price =
          billingCycle === "ANNUAL"
            ? PLAN_PRICES_ANNUAL[p]
            : PLAN_PRICES_MONTHLY[p];

        return (
          <div
            key={p}
            className={cn(
              "relative flex flex-col rounded-2xl border p-5 transition-all",
              isCurrent
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
            )}
          >
            {isCurrent && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                Plan actuel
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {PLAN_NAMES[p].split("—")[0]?.trim()}
            </p>
            <p className="font-bold text-primary text-sm">
              {PLAN_NAMES[p].split("—")[1]?.trim()}
            </p>
            <p className="my-3 text-2xl font-black">
              {price === 0 ? "Gratuit" : formatXOF(price)}
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                {price > 0
                  ? `/${billingCycle === "ANNUAL" ? "an" : "mois"}`
                  : ""}
              </span>
            </p>
            <ul className="mb-4 flex-1 space-y-1">
              {PLAN_FEATURES[p].map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={isCurrent ? "outline" : "default"}
              size="sm"
              disabled={isCurrent}
              onClick={() => !isCurrent && onUpgrade(p)}
              className="w-full"
            >
              {isCurrent ? "Plan actuel" : isDown ? "Rétrograder" : "Choisir"}
              {!isCurrent && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
