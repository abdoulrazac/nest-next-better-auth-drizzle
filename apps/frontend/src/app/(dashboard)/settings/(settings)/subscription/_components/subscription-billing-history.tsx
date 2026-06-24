// @ts-nocheck
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatXOF } from "@/lib/format";
import { PLAN_NAMES, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CreditCardIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";

const PAYMENT_STATUS_BADGE: Record<string, { label: string; class: string }> = {
  PENDING: { label: "En attente", class: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmé", class: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Échoué", class: "bg-red-100 text-red-700" },
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  LIGDICASH: "LigdiCash",
  PISPI: "PI-SPI",
  MANUAL: "Manuel",
  // Legacy
  ORANGE_MONEY: "Orange Money",
  MOOV_MONEY: "Moov Money",
  BANK_TRANSFER: "Virement",
};

interface Payment {
  id: string;
  createdAt: Date | string;
  plan: string;
  amount: number;
  paymentMode: string;
  reference?: string | null;
  status: string;
}

interface Props {
  pendingPayments: Payment[];
  confirmedPayments: Payment[];
  plan: PlanId;
  onUpgrade?: (plan: PlanId) => void;
  onRefetch?: () => void;
}

export function SubscriptionBillingHistory({
  pendingPayments,
  confirmedPayments,
  plan,
  onUpgrade,
}: Props) {
  // État vide : plan gratuit, aucun paiement
  if (
    confirmedPayments.length === 0 &&
    pendingPayments.length === 0 &&
    plan === "FREE"
  ) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Icon
            icon={CreditCardIcon}
            className="h-10 w-10 text-muted-foreground/50"
          />
          <p className="font-semibold text-muted-foreground">
            Aucun historique de facturation
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Vous êtes sur le plan gratuit. Passez à un plan payant pour accéder
            à plus de fonctionnalités.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paiements en attente — confirmation automatique via webhook */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-amber-600">
              Paiements en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {format(new Date(p.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {PLAN_NAMES[p.plan as PlanId] ?? p.plan}
                    </TableCell>
                    <TableCell className="text-sm font-bold">
                      {formatXOF(p.amount)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {PAYMENT_MODE_LABELS[p.paymentMode] ?? p.paymentMode}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-xs text-amber-700">
                        En attente
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Historique confirmé */}
      {confirmedPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon icon={CreditCardIcon} className="h-5 w-5" />
              Historique de facturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedPayments.map((p) => {
                  const badge = PAYMENT_STATUS_BADGE[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">
                        {format(new Date(p.createdAt), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {PLAN_NAMES[p.plan as PlanId] ?? p.plan}
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        {formatXOF(p.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {PAYMENT_MODE_LABELS[p.paymentMode] ?? p.paymentMode}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", badge?.class)}>
                          {badge?.label ?? p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
