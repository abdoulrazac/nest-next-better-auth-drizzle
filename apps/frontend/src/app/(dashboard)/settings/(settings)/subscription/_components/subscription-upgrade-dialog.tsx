// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/format";
import {
  ORDERED_PLANS,
  PLAN_NAMES,
  PLAN_PRICES_ANNUAL,
  PLAN_PRICES_MONTHLY,
  type PlanId,
} from "@/lib/plans";
import { api } from "@/trpc/react";
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  targetPlan: PlanId;
  billingCycle: "MONTHLY" | "ANNUAL";
  onClose: () => void;
  onSuccess: () => void;
}

type DialogState =
  | "IDLE"
  | "LOADING"
  | "WAITING"
  | "SUCCESS"
  | "ERROR"
  | "TIMEOUT";

export function SubscriptionUpgradeDialog({
  targetPlan,
  billingCycle,
  onClose,
  onSuccess,
}: Props) {
  const [state, setState] = useState<DialogState>("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const price =
    billingCycle === "ANNUAL"
      ? PLAN_PRICES_ANNUAL[targetPlan]
      : PLAN_PRICES_MONTHLY[targetPlan];

  const { data: paymentStatus } =
    api.settings.subscription.getPaymentStatus.useQuery(
      { subscriptionPaymentId: paymentId! },
      {
        enabled: !!paymentId && state === "WAITING",
        refetchInterval: 3000,
      },
    );

  const utils = api.useUtils();

  const requestUpgrade = api.settings.subscription.requestUpgrade.useMutation({
    onError: (e) => {
      setState("ERROR");
      setErrorMsg(e.message);
    },
  });

  // Réaction au polling
  useEffect(() => {
    if (paymentStatus?.status === "CONFIRMED") {
      setState("SUCCESS");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      void utils.settings.subscription.invalidate();
      onSuccess();
    } else if (paymentStatus?.status === "FAILED") {
      setState("ERROR");
      setErrorMsg("Le paiement a échoué ou a été annulé. Veuillez réessayer.");
    }
  }, [paymentStatus?.status]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePay = async () => {
    setState("LOADING");

    // Anti-bloqueur popup : ouvrir la fenêtre AVANT le await
    const newTab = window.open("about:blank", "_blank");

    let result: { payUrl: string; subscriptionPaymentId: string } | undefined;
    try {
      result = await requestUpgrade.mutateAsync({
        plan: targetPlan,
        billingCycle,
      });
    } catch {
      newTab?.close();
      return; // onError gère setState("ERROR")
    }

    if (!result.payUrl) {
      // Downgrade FREE — pas de paiement
      newTab?.close();
      setState("SUCCESS");
      void utils.settings.subscription.invalidate();
      onSuccess();
      return;
    }

    // Naviguer vers la page de paiement LigdiCash
    if (newTab) {
      newTab.location.href = result.payUrl;
    } else {
      // Fallback si popup bloqué
      window.open(result.payUrl, "_blank");
    }

    setPaymentId(result.subscriptionPaymentId);
    setPayUrl(result.payUrl);
    setState("WAITING");

    // Timeout 15 minutes
    timeoutRef.current = setTimeout(
      () => {
        setState("TIMEOUT");
      },
      15 * 60 * 1000,
    );
  };

  // ── États ────────────────────────────────────────────────────────────────

  if (state === "SUCCESS") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold">Plan activé !</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Votre abonnement {PLAN_NAMES[targetPlan]} est maintenant actif.
        </p>
        <Button onClick={onClose}>Fermer</Button>
      </div>
    );
  }

  if (state === "TIMEOUT") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <h3 className="text-lg font-bold">Paiement non reçu</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Nous n'avons pas encore reçu la confirmation. Si vous avez payé, votre
          plan sera mis à jour dès validation.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {payUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(payUrl, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ré-ouvrir le paiement
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (state === "ERROR") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="text-lg font-bold">Erreur de paiement</h3>
        <p className="max-w-xs text-sm text-muted-foreground">{errorMsg}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => setState("IDLE")}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (state === "WAITING") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h3 className="text-lg font-bold">En attente de votre paiement</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Complétez le paiement dans l'onglet ouvert. Cette page se met à jour
          automatiquement.
        </p>
        {payUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(payUrl, "_blank")}
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Ré-ouvrir la page de paiement
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground"
        >
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Récap commande */}
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div>
          <p className="font-bold">{PLAN_NAMES[targetPlan]}</p>
          <p className="text-xs text-muted-foreground">
            {billingCycle === "ANNUAL"
              ? "Facturation annuelle"
              : "Facturation mensuelle"}
          </p>
        </div>
        <p className="text-2xl font-black text-primary">
          {targetPlan === "FREE" ? "Gratuit" : formatXOF(price)}
        </p>
      </div>

      {/* Avertissement downgrade */}
      {targetPlan === "FREE" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Votre abonnement sera résilié en fin de période actuelle. Vous
            perdrez l'accès aux fonctionnalités avancées.
          </p>
        </div>
      )}

      {/* Info paiement */}
      <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
        <p>
          Paiement sécurisé via{" "}
          <strong className="text-foreground">LigdiCash</strong> — Orange Money,
          Moov Money, Wave et plus.
        </p>
        <p className="mt-1">
          Vous serez redirigé vers la page de paiement LigdiCash dans un nouvel
          onglet.
        </p>
      </div>

      <Button
        className="w-full"
        disabled={state === "LOADING"}
        onClick={handlePay}
      >
        {state === "LOADING" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {targetPlan === "FREE" ? "Résilier l'abonnement" : "Payer maintenant"}
      </Button>
    </div>
  );
}
