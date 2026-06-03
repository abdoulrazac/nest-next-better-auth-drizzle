// @ts-nocheck
"use client";

/**
 * Page d'intégration DGI — e-MECEF Driver
 */

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type McfVtType = "FV" | "CV" | "EV" | "EC";
type McfClientType = "CC" | "PM" | "PP" | "PC";
type McfItemType = "LOCBIE" | "LOCSER" | "IMPBIE" | "IMPSER";
type McfPaymentMode = "V" | "C" | "M" | "D" | "E" | "A";
type McfPriceMode = "TTC" | "HT";

interface DgiFormState {
  enabled: boolean;
  driverMode: "local" | "cloud";
  baseUrl: string;
  billEndpoint: string;
  timeoutMs: number;
  taxGroupByVatRate: Record<string, string>;
  defaults: {
    clientType: McfClientType;
    priceMode: McfPriceMode;
    vt: McfVtType;
    paymentMode: McfPaymentMode;
    operatorId: string;
    operatorName: string;
    itemType: McfItemType;
    includeBankInfo: boolean;
    includeFiscalRegime: boolean;
  };
}

interface DgiDriverStatusResult {
  reachable: boolean;
  deviceConnected?: boolean;
  licenseValid?: boolean;
  version?: string;
  mock?: boolean;
  error?: string;
}

interface DgiTestResult {
  success: boolean;
  statusCode?: number;
  body?: string;
}

interface DgiDeviceInfoResult {
  nim?: string;
  ifu?: string;
  name?: string;
  address?: string;
  phone?: string;
  fiscalCenter?: string;
  taxOffice?: string;
}

interface DgiDiagnosticsResult {
  driverStatus: DgiDriverStatusResult;
  deviceCheck: DgiTestResult;
  serialPorts: string[];
  deviceInfo?: DgiDeviceInfoResult;
  deviceInfoError?: string;
}

const DEFAULT_VALUES: DgiFormState = {
  enabled: false,
  driverMode: "local",
  baseUrl: "http://127.0.0.1:38917",
  billEndpoint: "/bill",
  timeoutMs: 10000,
  taxGroupByVatRate: { "0": "A", "18": "B", "10": "C" },
  defaults: {
    clientType: "CC",
    priceMode: "HT",
    vt: "FV",
    paymentMode: "V",
    operatorId: "1",
    operatorName: "Caisse",
    itemType: "LOCSER",
    includeBankInfo: true,
    includeFiscalRegime: true,
  },
};

export default function DgiIntegrationPage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    statusCode?: number;
    body?: string;
  } | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] =
    useState<DgiDiagnosticsResult | null>(null);

  const form = useForm<DgiFormState>({ defaultValues: DEFAULT_VALUES });
  const utils = api.useUtils();
  const driverMode = form.watch("driverMode");
  const isEnabled = form.watch("enabled");

  const { data: config, isLoading } =
    api.settings.dgiIntegration.getConfig.useQuery();

  // URL WS = même hôte + chemin /api/mcf-ws (next-ws, pas de serveur custom)
  const wsUrl = (() => {
    try {
      const appUrl = new URL(
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      );
      const wsProtocol = appUrl.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${appUrl.host}/api/mcf-ws`;
    } catch {
      return "ws://localhost:3000/api/mcf-ws";
    }
  })();

  const {
    data: cloudStatus,
    refetch: refetchCloudStatus,
    isFetching: isRefetchingCloud,
  } = api.settings.dgiIntegration.getCloudDriverStatus.useQuery(undefined, {
    enabled: isEnabled && driverMode === "cloud",
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  const updateMutation = api.settings.dgiIntegration.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration e-MECEF enregistrée");
      void utils.settings.dgiIntegration.invalidate();
    },
    onError: (e) => toast.error(e.message ?? "Erreur lors de la sauvegarde"),
  });

  useEffect(() => {
    if (!config) return;
    form.reset({
      enabled: config.enabled,
      driverMode: config.driverMode ?? "local",
      baseUrl: config.baseUrl,
      billEndpoint: config.billEndpoint,
      timeoutMs: config.timeoutMs,
      taxGroupByVatRate: config.taxGroupByVatRate,
      defaults: {
        clientType: config.defaults.clientType,
        priceMode: config.defaults.priceMode,
        vt: config.defaults.vt as McfVtType,
        paymentMode: config.defaults.paymentMode as McfPaymentMode,
        operatorId: config.defaults.operatorId,
        operatorName: config.defaults.operatorName,
        itemType: config.defaults.itemType,
        includeBankInfo: config.defaults.includeBankInfo,
        includeFiscalRegime: config.defaults.includeFiscalRegime,
      },
    });
  }, [config, form]);

  const onSubmit = (values: DgiFormState) => {
    updateMutation.mutate({
      enabled: values.enabled,
      driverMode: values.driverMode,
      baseUrl: values.baseUrl,
      billEndpoint: values.billEndpoint,
      timeoutMs: values.timeoutMs,
      taxGroupByVatRate: values.taxGroupByVatRate,
      defaults: values.defaults,
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await utils.settings.dgiIntegration.testConnection.fetch();
      setConnectionResult({
        success: result.success,
        statusCode: result.statusCode,
        body: result.body,
      });
      if (result.success) {
        toast.success(`Connexion réussie (HTTP ${result.statusCode ?? 200})`);
      } else {
        toast.warning("Le driver e-MECEF ne répond pas.");
      }
    } catch {
      setConnectionResult({ success: false, body: "Connexion impossible" });
      toast.error("Impossible de contacter le driver e-MECEF");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const [driverStatus, deviceCheck, serialPortsResult] = await Promise.all([
        utils.settings.dgiIntegration.getDriverStatus.fetch(),
        utils.settings.dgiIntegration.checkDevice.fetch(),
        utils.settings.dgiIntegration.getSerialPorts.fetch(),
      ]);

      let deviceInfo: DgiDeviceInfoResult | undefined;
      let deviceInfoError: string | undefined;

      try {
        deviceInfo = await utils.settings.dgiIntegration.getDeviceInfo.fetch();
      } catch (error) {
        deviceInfoError =
          error instanceof Error
            ? error.message
            : "Informations terminal indisponibles";
      }

      setDiagnosticsResult({
        driverStatus,
        deviceCheck,
        serialPorts: serialPortsResult.ports,
        deviceInfo,
        deviceInfoError,
      });

      toast.success("Diagnostic DGI terminé.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Diagnostic impossible: ${message}`);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certification des factures (DGI)"
        description="Configuration du driver de certification fiscale DGI"
        variant="list"
        status={{
          label: config?.enabled ? "Actif" : "Inactif",
          variant: config?.enabled ? "default" : "secondary",
        }}
      />

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground animate-pulse">
            Chargement de la configuration…
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Connexion ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Connexion au driver</CardTitle>
              <CardDescription>
                Le driver e-MECEF doit être démarré sur le poste opérateur
                (défaut : http://127.0.0.1:38917)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">
                    Activer la certification e-MECEF
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chaque facture validée sera certifiée par le terminal MCF
                  </p>
                </div>
                <Controller
                  name="enabled"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* ── Mode de connexion ── */}
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="font-medium">Mode de connexion</p>
                  <p className="text-sm text-muted-foreground">
                    Choisissez comment le driver MCF communique avec ce serveur
                  </p>
                </div>
                <Controller
                  name="driverMode"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      <Label
                        htmlFor="mode-local"
                        className="flex items-start gap-3 rounded-md border p-3 cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                      >
                        <RadioGroupItem
                          value="local"
                          id="mode-local"
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm">Local</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Driver HTTP sur le poste opérateur (127.0.0.1:38917)
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="mode-cloud"
                        className="flex items-start gap-3 rounded-md border p-3 cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                      >
                        <RadioGroupItem
                          value="cloud"
                          id="mode-cloud"
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm">Cloud (WSS)</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Driver se connecte au serveur via WebSocket — idéal
                            pour SaaS
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* ── Statut driver cloud ── */}
              {driverMode === "cloud" && isEnabled && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      Statut driver cloud (WebSocket)
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void refetchCloudStatus()}
                      disabled={isRefetchingCloud}
                    >
                      {isRefetchingCloud ? "…" : "Rafraîchir"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          cloudStatus?.connected
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={
                          cloudStatus?.connected
                            ? "text-emerald-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {cloudStatus?.connected
                          ? "Driver connecté"
                          : "Driver hors ligne"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Factures en attente :{" "}
                      <span
                        className={
                          cloudStatus?.pendingCount
                            ? "text-amber-600 font-medium"
                            : ""
                        }
                      >
                        {cloudStatus?.pendingCount ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted px-3 py-2 text-xs space-y-1">
                    <p className="font-medium text-foreground">
                      Endpoint WebSocket du serveur :
                    </p>
                    <code className="font-mono text-primary">{wsUrl}</code>
                    <p className="text-muted-foreground mt-1">
                      Configurez{" "}
                      <code className="bg-background px-1 rounded">
                        DRIVER_WSS_URL={wsUrl}
                      </code>{" "}
                      et{" "}
                      <code className="bg-background px-1 rounded">
                        DRIVER_API_KEY=&lt;clé API org&gt;
                      </code>{" "}
                      et{" "}
                      <code className="bg-background px-1 rounded">
                        DRIVER_MODE=cloud
                      </code>{" "}
                      dans le fichier{" "}
                      <code className="bg-background px-1 rounded">.env</code>{" "}
                      du driver MCF. La clé API est envoyée via l&apos;en-tête{" "}
                      <code className="bg-background px-1 rounded">
                        Authorization: Bearer
                      </code>{" "}
                      lors du handshake WebSocket.
                    </p>
                  </div>

                  {cloudStatus?.connected && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-3 py-2">
                      ✓ WebSocket actif — les factures PENDING_MCF sont envoyées
                      automatiquement au driver.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL du driver</Label>
                  <Controller
                    name="baseUrl"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        placeholder="http://127.0.0.1:38917"
                        {...field}
                        disabled={driverMode === "cloud"}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endpoint facturation</Label>
                  <Controller
                    name="billEndpoint"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        placeholder="/bill"
                        {...field}
                        disabled={driverMode === "cloud"}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout (ms)</Label>
                  <Controller
                    name="timeoutMs"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1000}
                        max={30000}
                        step={500}
                        disabled={driverMode === "cloud"}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            Math.min(
                              30000,
                              Math.max(1000, Number(e.target.value) || 10000),
                            ),
                          )
                        }
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {driverMode === "local" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection
                        ? "Test en cours…"
                        : "Tester GET /health"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRunDiagnostics}
                      disabled={isRunningDiagnostics}
                    >
                      {isRunningDiagnostics
                        ? "Diagnostic en cours…"
                        : "Lancer diagnostic complet"}
                    </Button>
                    {connectionResult && (
                      <span
                        className={
                          connectionResult.success
                            ? "text-green-600 text-sm"
                            : "text-red-600 text-sm"
                        }
                      >
                        {connectionResult.success
                          ? `✓ Connecté (HTTP ${connectionResult.statusCode})`
                          : `✗ Erreur : ${connectionResult.body}`}
                      </span>
                    )}
                  </>
                )}
              </div>

              {diagnosticsResult && driverMode === "local" && (
                <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="font-medium">Driver</p>
                    <p
                      className={
                        diagnosticsResult.driverStatus.reachable
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {diagnosticsResult.driverStatus.reachable
                        ? "Accessible"
                        : "Inaccessible"}
                    </p>
                    {diagnosticsResult.driverStatus.version && (
                      <p className="text-muted-foreground">
                        Version: {diagnosticsResult.driverStatus.version}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">Terminal MCF</p>
                    <p
                      className={
                        diagnosticsResult.deviceCheck.success
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {diagnosticsResult.deviceCheck.success
                        ? "Connecté"
                        : "Non connecté"}
                    </p>
                    <p className="text-muted-foreground">
                      HTTP: {diagnosticsResult.deviceCheck.statusCode ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Licence</p>
                    <p
                      className={
                        diagnosticsResult.driverStatus.licenseValid
                          ? "text-green-600"
                          : "text-amber-600"
                      }
                    >
                      {diagnosticsResult.driverStatus.licenseValid
                        ? "Valide"
                        : "À vérifier"}
                    </p>
                    <p className="text-muted-foreground">
                      {diagnosticsResult.driverStatus.error ??
                        "Aucune erreur bloquante"}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Ports série</p>
                    <p className="text-muted-foreground">
                      {diagnosticsResult.serialPorts.length > 0
                        ? diagnosticsResult.serialPorts.join(", ")
                        : "Aucun port détecté"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <p className="font-medium">Infos terminal / contribuable</p>
                    {diagnosticsResult.deviceInfo ? (
                      <p className="text-muted-foreground">
                        IFU: {diagnosticsResult.deviceInfo.ifu ?? "-"} · NIM:{" "}
                        {diagnosticsResult.deviceInfo.nim ?? "-"} · Nom:{" "}
                        {diagnosticsResult.deviceInfo.name ?? "-"}
                      </p>
                    ) : (
                      <p className="text-amber-600">
                        {diagnosticsResult.deviceInfoError ??
                          "Informations indisponibles"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Valeurs par défaut ─────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Valeurs par défaut</CardTitle>
              <CardDescription>
                Paramètres appliqués lors de la certification si non définis sur
                la facture
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Type de client par défaut</Label>
                <Controller
                  name="defaults.clientType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">CC — Client courant</SelectItem>
                        <SelectItem value="PM">PM — Personne Morale</SelectItem>
                        <SelectItem value="PP">
                          PP — Personne Physique
                        </SelectItem>
                        <SelectItem value="PC">PC — Particulier</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Mode de saisie des prix</Label>
                <Controller
                  name="defaults.priceMode"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HT">HT — Hors taxes</SelectItem>
                        <SelectItem value="TTC">TTC — Toutes taxes</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Type de facture (vt)</Label>
                <Controller
                  name="defaults.vt"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FV">
                          FV — Facture de vente
                        </SelectItem>
                        <SelectItem value="CV">CV — Contre vente</SelectItem>
                        <SelectItem value="EV">
                          EV — État de vente (export)
                        </SelectItem>
                        <SelectItem value="EC">EC — État de crédit</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Mode de paiement MCF par défaut</Label>
                <Controller
                  name="defaults.paymentMode"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V">V — Virement</SelectItem>
                        <SelectItem value="C">C — Carte bancaire</SelectItem>
                        <SelectItem value="M">M — Mobile Money</SelectItem>
                        <SelectItem value="D">D — Chèque</SelectItem>
                        <SelectItem value="E">E — Espèces</SelectItem>
                        <SelectItem value="A">A — Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Type d&apos;article par défaut</Label>
                <Controller
                  name="defaults.itemType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOCSER">
                          LOCSER — Service local
                        </SelectItem>
                        <SelectItem value="LOCBIE">
                          LOCBIE — Bien local
                        </SelectItem>
                        <SelectItem value="IMPSER">
                          IMPSER — Service importé
                        </SelectItem>
                        <SelectItem value="IMPBIE">
                          IMPBIE — Bien importé
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>ID opérateur (OPID)</Label>
                <Controller
                  name="defaults.operatorId"
                  control={form.control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div className="space-y-2">
                <Label>Nom opérateur (OPNOM)</Label>
                <Controller
                  name="defaults.operatorName"
                  control={form.control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div className="col-span-full flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Controller
                    name="defaults.includeBankInfo"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label>Inclure les infos bancaires (COMBAN)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="defaults.includeFiscalRegime"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label>Inclure le régime fiscal (REGIMP)</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Mapping TVA → Groupes MCF ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Mapping TVA → Groupes de taxe MCF</CardTitle>
              <CardDescription>
                Les groupes A à P sont configurés sur votre terminal MCF
                Eltrade. Associez chaque taux TVA (en %) à son groupe
                correspondant.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { rate: "0", label: "TVA 0%" },
                { rate: "10", label: "TVA 10%" },
                { rate: "18", label: "TVA 18%" },
              ].map(({ rate, label }) => (
                <div key={rate} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    placeholder="A"
                    maxLength={1}
                    value={
                      (
                        form.watch("taxGroupByVatRate") as Record<
                          string,
                          string
                        >
                      )[rate] ?? ""
                    }
                    onChange={(e) => {
                      const updated = {
                        ...form.getValues("taxGroupByVatRate"),
                        [rate]: e.target.value.toUpperCase(),
                      };
                      form.setValue("taxGroupByVatRate", updated);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? "Enregistrement…"
                : "Enregistrer la configuration"}
            </Button>
            <Button variant="outline" type="button" asChild>
              <a
                href="https://e-mecef.codarno.com/docs#api"
                target="_blank"
                rel="noreferrer"
              >
                Documentation e-MECEF
              </a>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
