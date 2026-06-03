// @ts-nocheck
"use client";

import PageHeader from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLAN_NAMES, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AlertCircleIcon, LoadingIcon, SmartphoneIcon } from "@/lib/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { SubscriptionBillingHistory } from "./_components/subscription-billing-history";
import { SubscriptionPlanCard } from "./_components/subscription-plan-card";
import { SubscriptionPlanSelector } from "./_components/subscription-plan-selector";
import { SubscriptionUpgradeDialog } from "./_components/subscription-upgrade-dialog";
import { SubscriptionUsage } from "./_components/subscription-usage";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">(
    "MONTHLY",
  );
  const [upgradeTarget, setUpgradeTarget] = useState<PlanId | null>(null);
  const utils = api.useUtils();

  const { data, isLoading, error } = api.settings.subscription.get.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex h-64 items-center justify-center">
          <HugeiconsIcon
            icon={LoadingIcon}
            className="h-8 w-8 animate-spin text-primary"
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="h-10 w-10 text-destructive"
          />
          <p className="font-semibold">
            Impossible de charger les données d'abonnement
          </p>
          <p className="text-sm text-muted-foreground">
            {error?.message ?? "Erreur inconnue"}
          </p>
        </div>
      </div>
    );
  }

  const plan = data.plan as PlanId;
  const pendingPayments =
    data.payments?.filter((p) => p.status === "PENDING") ?? [];
  const confirmedPayments =
    data.payments?.filter((p) => p.status === "CONFIRMED") ?? [];

  return (
    <div className="flex flex-col">
      <div className="space-y-6">
        <PageHeader
          title="Abonnement"
          description="Gérez votre plan et votre facturation"
          variant="list"
        />

        {/* Alerte paiements en attente */}
        {pendingPayments.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            />
            <div>
              <p className="font-semibold text-sm">
                {pendingPayments.length} paiement(s) en attente de confirmation
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Votre plan sera mis à jour dès validation. Délai : 2h ouvrables.
              </p>
            </div>
          </div>
        )}

        {/* Plan actuel + Utilisation */}
        <div className="grid gap-6 lg:grid-cols-3">
          <SubscriptionPlanCard data={data} onUpgrade={setUpgradeTarget} />
          <SubscriptionUsage
            plan={plan}
            usage={data.usage}
            onUpgrade={setUpgradeTarget}
          />
        </div>

        {/* Sélecteur de plan */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-base">Changer de plan</h2>
            <div className="flex rounded-lg border bg-muted/30 p-1 text-sm">
              {(["MONTHLY", "ANNUAL"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBillingCycle(c)}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium transition-all",
                    billingCycle === c
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground",
                  )}
                >
                  {c === "MONTHLY" ? "Mensuel" : "Annuel"}
                  {c === "ANNUAL" && (
                    <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600">
                      -17%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <SubscriptionPlanSelector
            currentPlan={plan}
            billingCycle={billingCycle}
            onUpgrade={setUpgradeTarget}
          />

          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <HugeiconsIcon icon={SmartphoneIcon} className="h-4 w-4 shrink-0" />
            <span>Paiement sécurisé via</span>
            <span className="font-medium text-foreground">LigdiCash</span>
            <span>—</span>
            <span className="font-medium text-foreground">🟠 Orange Money</span>
            <span className="font-medium text-foreground">🔵 Moov Money</span>
            <span className="font-medium text-foreground">🌊 Wave</span>
            <span>et plus</span>
          </div>
        </div>

        {/* Historique de facturation */}
        <SubscriptionBillingHistory
          plan={plan}
          pendingPayments={pendingPayments}
          confirmedPayments={confirmedPayments}
          onUpgrade={setUpgradeTarget}
        />
      </div>

      {/* Dialog mise à niveau */}
      <Dialog
        open={!!upgradeTarget}
        onOpenChange={(o) => !o && setUpgradeTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {upgradeTarget
                ? `Passer au plan ${PLAN_NAMES[upgradeTarget]}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          {upgradeTarget && (
            <SubscriptionUpgradeDialog
              targetPlan={upgradeTarget}
              billingCycle={billingCycle}
              onClose={() => setUpgradeTarget(null)}
              onSuccess={async () => {
                await utils.settings.subscription.invalidate();
                setUpgradeTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
