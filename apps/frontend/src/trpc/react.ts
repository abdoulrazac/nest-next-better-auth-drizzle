/**
 * tRPC → apiClient adapter
 *
 * Provides a drop-in `api` object that mimics tRPC's React hooks
 * (api.namespace.procedure.useQuery / useMutation / useUtils)
 * but delegates to @tanstack/react-query + apiClient under the hood.
 *
 * Pattern:
 *   api.settings.general.getAll.useQuery(input?, opts?) → useQuery(...)
 *   api.settings.general.update.useMutation(opts?)     → useMutation(...)
 *   api.useUtils() → proxy with .namespace.procedure.invalidate()
 */
import { apiClient } from "@/lib/api";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

// ─── helpers ────────────────────────────────────────────────────────────────

type AnyFn = (...args: any[]) => any;

function makeQuery<TData = any>(
  keyBase: readonly unknown[],
  fetcher: (input?: any) => Promise<TData>,
) {
  return {
    useQuery(
      input?: any,
      opts?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
    ) {
      return useQuery<TData>({
        queryKey: input !== undefined ? [...keyBase, input] : [...keyBase],
        queryFn: () => fetcher(input),
        ...opts,
      });
    },
    /** expose keyBase so useUtils can build invalidation keys */
    _keyBase: keyBase,
  };
}

function makeMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  opts?: UseMutationOptions<TData, Error, TVariables>,
) {
  return {
    useMutation(hookOpts?: UseMutationOptions<TData, Error, TVariables>) {
      return useMutation<TData, Error, TVariables>({
        mutationFn,
        ...opts,
        ...hookOpts,
      });
    },
  };
}

async function get<T>(url: string, query?: Record<string, any>): Promise<T> {
  const res = (await apiClient.get({ url, query })) as any;
  return res.data as T;
}

async function post<T>(url: string, body?: any): Promise<T> {
  const res = (await apiClient.post({ url, body })) as any;
  return res.data as T;
}

async function patch<T>(url: string, body?: any): Promise<T> {
  const res = (await apiClient.patch({ url, body })) as any;
  return res.data as T;
}

async function del<T>(url: string, body?: any): Promise<T> {
  const res = (await apiClient.delete({ url, body })) as any;
  return res.data as T;
}

// ─── namespace builders ──────────────────────────────────────────────────────

const accounts = {
  userManagement: {
    getMembers: makeQuery(
      ["accounts", "userManagement", "getMembers"],
      (input) => get("/v1/accounts/users", input),
    ),
    getInvitations: makeQuery(
      ["accounts", "userManagement", "getInvitations"],
      (input) => get("/v1/accounts/invitations", input),
    ),
    createUser: makeMutation((data: any) => post("/v1/accounts/users", data)),
    inviteUser: makeMutation((data: any) =>
      post("/v1/accounts/invitations", data),
    ),
    updateRole: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/accounts/users/${id}`, data),
    ),
    deleteUser: makeMutation((id: string) => del(`/v1/accounts/users/${id}`)),
    revokeInvitation: makeMutation((id: string) =>
      del(`/v1/accounts/invitations/${id}`),
    ),
  },
};

const common = {
  audit: {
    getAll: makeQuery(["common", "audit", "getAll"], (input) =>
      get("/v1/audit-logs", input),
    ),
    getMyLogs: makeQuery(["common", "audit", "getMyLogs"], (input) =>
      get("/v1/audit-logs/me", input),
    ),
  },
  taxRate: {
    getAll: makeQuery(["common", "taxRate", "getAll"], (input) =>
      get("/v1/tax-rates", input),
    ),
    getById: makeQuery(["common", "taxRate", "getById"], (id: string) =>
      get(`/v1/tax-rates/${id}`),
    ),
    create: makeMutation((data: any) => post("/v1/tax-rates", data)),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/tax-rates/${id}`, data),
    ),
    delete: makeMutation((id: string) => del(`/v1/tax-rates/${id}`)),
  },
  specificTax: {
    getAll: makeQuery(["common", "specificTax", "getAll"], (input) =>
      get("/v1/specific-taxes", input),
    ),
    getById: makeQuery(["common", "specificTax", "getById"], (id: string) =>
      get(`/v1/specific-taxes/${id}`),
    ),
    search: makeQuery(["common", "specificTax", "search"], (input) =>
      get("/v1/specific-taxes/search", input),
    ),
    create: makeMutation((data: any) => post("/v1/specific-taxes", data)),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/specific-taxes/${id}`, data),
    ),
    delete: makeMutation((id: string) => del(`/v1/specific-taxes/${id}`)),
    toggleStatus: makeMutation((id: string) =>
      patch(`/v1/specific-taxes/${id}/toggle-status`),
    ),
  },
  psvbRate: {
    getAll: makeQuery(["common", "psvbRate", "getAll"], (input) =>
      get("/v1/psvb-rates", input),
    ),
    getById: makeQuery(["common", "psvbRate", "getById"], (id: string) =>
      get(`/v1/psvb-rates/${id}`),
    ),
    create: makeMutation((data: any) => post("/v1/psvb-rates", data)),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/psvb-rates/${id}`, data),
    ),
    delete: makeMutation((id: string) => del(`/v1/psvb-rates/${id}`)),
  },
  unit: {
    getAll: makeQuery(["common", "unit", "getAll"], (input) =>
      get("/v1/units", input),
    ),
    getById: makeQuery(["common", "unit", "getById"], (id: string) =>
      get(`/v1/units/${id}`),
    ),
    create: makeMutation((data: any) => post("/v1/units", data)),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/units/${id}`, data),
    ),
    delete: makeMutation((id: string) => del(`/v1/units/${id}`)),
  },
};

const settings = {
  dashboard: {
    getChart: makeQuery(["settings", "dashboard", "getChart"], (input) =>
      get("/v1/settings/dashboard/chart", input),
    ),
    getKpis: makeQuery(["settings", "dashboard", "getKpis"], (input) =>
      get("/v1/settings/dashboard/kpis", input),
    ),
    getRecentEntities: makeQuery(
      ["settings", "dashboard", "getRecentEntities"],
      (input) => get("/v1/settings/dashboard/recent", input),
    ),
  },
  backup: {
    getAll: makeQuery(["settings", "backup", "getAll"], (input) =>
      get("/v1/settings/backup", input),
    ),
    getStats: makeQuery(["settings", "backup", "getStats"], () =>
      get("/v1/settings/backup/stats"),
    ),
    create: makeMutation((data?: any) => post("/v1/settings/backup", data)),
    restore: makeMutation((id: string) =>
      post(`/v1/settings/backup/${id}/restore`),
    ),
    download: makeMutation((id: string) =>
      post(`/v1/settings/backup/${id}/download`),
    ),
    delete: makeMutation((id: string) => del(`/v1/settings/backup/${id}`)),
  },
  company: {
    get: makeQuery(["settings", "company", "get"], () =>
      get("/v1/settings/company"),
    ),
    update: makeMutation((data: any) => patch("/v1/settings/company", data)),
  },
  dgiIntegration: {
    getConfig: makeQuery(["settings", "dgiIntegration", "getConfig"], () =>
      get("/v1/settings/dgi"),
    ),
    getCloudDriverStatus: makeQuery(
      ["settings", "dgiIntegration", "getCloudDriverStatus"],
      () => get("/v1/settings/dgi/cloud-driver-status"),
    ),
    updateConfig: makeMutation((data: any) => patch("/v1/settings/dgi", data)),
  },
  fiscalYear: {
    getAll: makeQuery(["settings", "fiscalYear", "getAll"], (input) =>
      get("/v1/settings/fiscal-years", input),
    ),
    getById: makeQuery(["settings", "fiscalYear", "getById"], (id: string) =>
      get(`/v1/settings/fiscal-years/${id}`),
    ),
    create: makeMutation((data: any) =>
      post("/v1/settings/fiscal-years", data),
    ),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/settings/fiscal-years/${id}`, data),
    ),
    delete: makeMutation((id: string) =>
      del(`/v1/settings/fiscal-years/${id}`),
    ),
    close: makeMutation((id: string) =>
      post(`/v1/settings/fiscal-years/${id}/close`),
    ),
    setDefault: makeMutation((id: string) =>
      post(`/v1/settings/fiscal-years/${id}/set-default`),
    ),
  },
  general: {
    getAll: makeQuery(["settings", "general", "getAll"], () =>
      get("/v1/settings/app"),
    ),
    update: makeMutation((data: any) => patch("/v1/settings/app", data)),
  },
  reminderConfig: {
    getAll: makeQuery(["settings", "reminderConfig", "getAll"], () =>
      get("/v1/settings/reminders"),
    ),
    upsertAll: makeMutation((data: any) =>
      post("/v1/settings/reminders", data),
    ),
  },
  sequence: {
    getAll: makeQuery(["settings", "sequence", "getAll"], () =>
      get("/v1/settings/sequences"),
    ),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/settings/sequences/${id}`, data),
    ),
    reset: makeMutation((id: string) =>
      post(`/v1/settings/sequences/${id}/reset`),
    ),
    initializeDefaults: makeMutation(() =>
      post("/v1/settings/sequences/initialize"),
    ),
  },
  subscription: {
    get: makeQuery(["settings", "subscription", "get"], () =>
      get("/v1/settings/subscription"),
    ),
    getPaymentStatus: makeQuery(
      ["settings", "subscription", "getPaymentStatus"],
      (input) => get("/v1/settings/subscription/payment-status", input),
    ),
    requestUpgrade: makeMutation((data: any) =>
      post("/v1/settings/subscription/upgrade", data),
    ),
  },
  template: {
    getAll: makeQuery(["settings", "template", "getAll"], (input) =>
      get("/v1/settings/templates", input),
    ),
    getContent: makeQuery(
      ["settings", "template", "getContent"],
      (id: string) => get(`/v1/settings/templates/${id}/content`),
    ),
    create: makeMutation((data: any) => post("/v1/settings/templates", data)),
    createFromContent: makeMutation((data: any) =>
      post("/v1/settings/templates/from-content", data),
    ),
    update: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/settings/templates/${id}`, data),
    ),
    updateContent: makeMutation(({ id, ...data }: any) =>
      patch(`/v1/settings/templates/${id}/content`, data),
    ),
    getDownloadUrl: makeMutation((id: string) =>
      post(`/v1/settings/templates/${id}/download-url`),
    ),
    delete: makeMutation((id: string) => del(`/v1/settings/templates/${id}`)),
  },
  webhook: {
    getAll: makeQuery(["settings", "webhook", "getAll"], (input) =>
      get("/v1/webhooks", input),
    ),
    create: makeMutation((data: any) => post("/v1/webhooks", data)),
    delete: makeMutation((id: string) => del(`/v1/webhooks/${id}`)),
    test: makeMutation((id: string) => post(`/v1/webhooks/${id}/test`)),
  },
  importExport: {
    downloadTemplate: makeMutation((data: any) =>
      post("/v1/settings/import-export/template", data),
    ),
    export: makeMutation((data: any) =>
      post("/v1/settings/import-export/export", data),
    ),
    import: makeMutation((data: any) =>
      post("/v1/settings/import-export/import", data),
    ),
  },
};

// ─── useUtils proxy ──────────────────────────────────────────────────────────

/**
 * Recursively builds an invalidation proxy from a namespace object.
 * - namespace.procedure.invalidate() → invalidates [keyBase] + sub-keys
 * - namespace.invalidate()           → invalidates [ns1, ns2] prefix
 */
function buildInvalidationProxy(
  obj: any,
  queryClient: ReturnType<typeof useQueryClient>,
  keyPrefix: readonly string[],
): any {
  return new Proxy(obj, {
    get(target, prop: string) {
      if (prop === "invalidate") {
        return () => queryClient.invalidateQueries({ queryKey: keyPrefix });
      }
      const child = target[prop];
      if (child && typeof child === "object") {
        const childKey = child._keyBase ?? [...keyPrefix, prop];
        return buildInvalidationProxy(child, queryClient, childKey);
      }
      return child;
    },
  });
}

function useUtils() {
  const queryClient = useQueryClient();
  return {
    accounts: buildInvalidationProxy(accounts, queryClient, ["accounts"]),
    common: buildInvalidationProxy(common, queryClient, ["common"]),
    settings: buildInvalidationProxy(settings, queryClient, ["settings"]),
  };
}

// ─── public api object ───────────────────────────────────────────────────────

export const api = {
  accounts,
  common,
  settings,
  useUtils,
};
