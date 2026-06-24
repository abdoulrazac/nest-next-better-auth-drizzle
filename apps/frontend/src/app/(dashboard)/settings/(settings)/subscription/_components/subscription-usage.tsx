// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { AlertCircleIcon } from "@/lib/icons";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
}

function UsageMeter({ label, current, max }: UsageMeterProps) {
  const unlimited = max === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((current / max) * 100));
  const isWarning = !unlimited && pct >= 70;
  const isDanger = !unlimited && pct >= 90;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-semibold",
            isDanger
              ? "text-destructive"
              : isWarning
                ? "text-amber-500"
                : "text-foreground",
          )}
        >
          {current}
          {!unlimited && ` / ${max}`}
          {unlimited && (
            <span className="ml-1 text-xs text-emerald-500">∞ illimité</span>
          )}
        </span>
      </div>
      {!unlimited && (
        <Progress
          value={pct}
          className={cn(
            "h-1.5",
            isDanger
              ? "[&>div]:bg-destructive"
              : isWarning
                ? "[&>div]:bg-amber-500"
                : "[&>div]:bg-primary",
          )}
        />
      )}
    </div>
  );
}

interface UsageData {
  invoicesThisMonth: number;
  clients: number;
  products: number;
  users: number;
}

interface Props {
  plan: PlanId;
  usage: UsageData;
  onUpgrade?: (plan: PlanId) => void;
}

export function SubscriptionUsage({ plan, usage, onUpgrade }: Props) {
  const limits = PLAN_LIMITS[plan];

  const warnings: string[] = [];
  if (
    limits.invoicesPerMonth !== -1 &&
    usage.invoicesThisMonth / limits.invoicesPerMonth >= 0.8
  ) {
    warnings.push(
      `factures (${usage.invoicesThisMonth}/${limits.invoicesPerMonth})`,
    );
  }
  if (limits.products !== -1 && usage.products / limits.products >= 0.8) {
    warnings.push(`produits (${usage.products}/${limits.products})`);
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Utilisation ce mois</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <UsageMeter
          label="Factures émises ce mois"
          current={usage.invoicesThisMonth}
          max={limits.invoicesPerMonth}
        />
        <UsageMeter
          label="Clients"
          current={usage.clients}
          max={limits.clients}
        />
        <UsageMeter
          label="Produits"
          current={usage.products}
          max={limits.products}
        />
        <UsageMeter
          label="Utilisateurs"
          current={usage.users}
          max={limits.users}
        />

        {warnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <Icon
              icon={AlertCircleIcon}
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
            />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Vous approchez de votre limite pour : {warnings.join(", ")}.{" "}
              {onUpgrade && (
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => onUpgrade("PRO")}
                >
                  Passer au plan Pro →
                </button>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
