"use client";

import { toast } from "sonner";

interface BulkResult {
  success: number;
  failed: number;
  errors: Error[];
}

export async function executeBulkAction<T>(
  items: T[],
  action: (item: T) => Promise<void>,
): Promise<BulkResult> {
  const result: BulkResult = { success: 0, failed: 0, errors: [] };
  await Promise.allSettled(
    items.map(async (item) => {
      try {
        await action(item);
        result.success++;
      } catch (e) {
        result.failed++;
        result.errors.push(e as Error);
      }
    }),
  );
  return result;
}

export function showBulkResultToast(
  result: BulkResult,
  successLabel = "Opération réussie",
  errorLabel = "Erreur",
) {
  if (result.success > 0 && result.failed === 0) {
    toast.success(`${successLabel} (${result.success})`);
  } else if (result.success > 0 && result.failed > 0) {
    toast.warning(`${result.success} réussie(s), ${result.failed} échouée(s)`);
  } else {
    toast.error(`${errorLabel} — ${result.failed} échouée(s)`);
  }
}
