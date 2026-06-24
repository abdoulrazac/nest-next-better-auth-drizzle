"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMemo } from "react";

export interface TableParamsConfig {
  /** Clés URL pour les filtres discrets (ex: ["status", "category"]) */
  filterKeys?: string[];
  /** Taille de page par défaut. Défaut : 10 */
  defaultPageSize?: number;
}

/**
 * Hook générique qui synchronise search, filtres et pagination avec l'URL.
 *
 * - Tous les changements utilisent `history: 'push'` (navigation complète).
 * - `setSearch`, `setFilter` et `setPageSize` remettent automatiquement `page` à 1.
 * - Les valeurs absentes de l'URL retournent leur défaut ("" ou 1 ou defaultPageSize).
 * - Passer `null` à nuqs supprime le paramètre de l'URL.
 */
export function useTableParams(config?: TableParamsConfig) {
  const filterKeys = config?.filterKeys ?? [];
  const defaultPageSize = config?.defaultPageSize ?? 10;

  const parsers = useMemo(
    () => ({
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
      ...Object.fromEntries(
        filterKeys.map((k) => [k, parseAsString.withDefault("")]),
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultPageSize, filterKeys.join(",")],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useQueryStates(parsers as any, {
    history: "push",
  });

  // Cast vers un type indexable pour accéder aux clés dynamiques
  const p = params as {
    search: string;
    page: number;
    pageSize: number;
    [key: string]: string | number;
  };

  return {
    // ── Recherche ────────────────────────────────────────────────────────────
    /** Valeur soumise (URL) */
    search: p.search,
    /** Mettre à jour la recherche et remettre page à 1 */
    setSearch: (value: string) =>
      void setParams({ search: value || null, page: 1 }),

    // ── Filtres ──────────────────────────────────────────────────────────────
    /** Lire la valeur d'un filtre (retourne "" si absent) */
    getFilter: (key: string): string => String(p[key] ?? ""),
    /** Mettre à jour un filtre et remettre page à 1 */
    setFilter: (key: string, value: string) =>
      void setParams({ [key]: value || null, page: 1 }),

    // ── Pagination ───────────────────────────────────────────────────────────
    page: p.page,
    setPage: (page: number) => void setParams({ page }),

    pageSize: p.pageSize,
    /** Changer la taille de page et remettre page à 1 */
    setPageSize: (size: number) => void setParams({ pageSize: size, page: 1 }),

    // ── Reset ────────────────────────────────────────────────────────────────
    /** Efface search + tous les filtres + remet page à 1. pageSize est conservé. */
    resetFilters: () =>
      void setParams({
        search: null,
        page: null,
        ...Object.fromEntries(filterKeys.map((k) => [k, null])),
      }),
  };
}
