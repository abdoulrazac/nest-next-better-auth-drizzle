// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import {
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import {
  executeBulkAction,
  showBulkResultToast,
} from "@/hooks/use-bulk-selection";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/hooks/use-confirm-dialog";
import { api } from "@/trpc/react";
import { Status } from "@/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Delete02Icon,
  FileSpreadsheetIcon,
  FileText,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UnitFormValues,
  unitDefaultValues,
  unitSchema,
} from "./unit-form";
import { unitsColumns } from "./units-table";
import {
  exportUnitsCSV,
  exportUnitsExcel,
  exportUnitsPDF,
} from "./use-units-export";

type ConfirmFn = ReturnType<typeof useConfirmDialog>["confirm"];

interface UseUnitsTableOptions {}

export function useUnitsTable({}: UseUnitsTableOptions = {}) {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  // ---- Filters / pagination / selection ----
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // ---- Dialog / form state ----
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: unitDefaultValues,
  });

  // ---- Query ----
  const { data, isLoading, error, refetch } = api.common.unit.getAll.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  // ---- Edit data fetch ----
  const { data: editingUnit, isLoading: isLoadingEdit } =
    api.common.unit.getById.useQuery(
      { id: editingId! },
      { enabled: Boolean(editingId) },
    );

  useEffect(() => {
    if (editingId && editingUnit) {
      const raw = editingUnit as Record<string, unknown>;
      form.reset({
        code: String(raw.code ?? (editingUnit as any).abbreviation ?? ""),
        name: (editingUnit as any).name ?? "",
        abbreviation: (editingUnit as any).abbreviation ?? "",
        description: String(raw.description ?? ""),
        baseUnitId: String(raw.baseUnitId ?? ""),
        conversionFactor: raw.conversionFactor
          ? Number(raw.conversionFactor)
          : undefined,
        status: raw.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      });
    }
  }, [editingUnit, editingId, form]);

  // ---- Mutations ----
  const deleteMutation = api.common.unit.delete.useMutation({
    onSuccess: () => {
      void utils.common.unit.invalidate();
      toast.success("Unité supprimée.");
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = api.common.unit.create.useMutation({
    onSuccess: () => {
      toast.success("Unité créée.");
      setDialogOpen(false);
      form.reset(unitDefaultValues);
      void utils.common.unit.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.common.unit.update.useMutation({
    onSuccess: () => {
      toast.success("Unité modifiée.");
      setDialogOpen(false);
      setEditingId(null);
      form.reset(unitDefaultValues);
      void utils.common.unit.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ---- Dialog handlers ----
  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(unitDefaultValues);
    setDialogOpen(true);
  }, [form]);

  const openEdit = useCallback((id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setEditingId(null);
        form.reset(unitDefaultValues);
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: UnitFormValues) => {
      const payload = {
        ...values,
        code: values.code.trim(),
        name: values.name.trim(),
        abbreviation: values.abbreviation.trim(),
        description: values.description || undefined,
        baseUnitId: values.baseUnitId || undefined,
        conversionFactor: values.conversionFactor || undefined,
      };
      if (editingId) {
        updateMutation.mutate({ id: editingId, ...payload });
      } else {
        createMutation.mutate(payload);
      }
    },
    [editingId, createMutation, updateMutation],
  );

  const submitForm = useCallback(() => {
    void form.handleSubmit(handleSubmit)();
  }, [form, handleSubmit]);

  // ---- Row actions ----
  const handleEdit = useCallback((id: string) => openEdit(id), [openEdit]);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm(
        confirmDialogPresets.delete("cette unité"),
      );
      if (confirmed) deleteMutation.mutate({ id });
    },
    [confirm, deleteMutation],
  );

  // ---- Bulk actions ----
  const selectedCount = selectedItems.length;

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error("Aucune unité sélectionnée");
      return;
    }
    const confirmed = await confirm({
      ...confirmDialogPresets.delete(),
      title: `Supprimer ${selectedItems.length} unité(s)`,
      description: `Êtes-vous sûr de vouloir supprimer les ${selectedItems.length} unités sélectionnées ? Cette action est irréversible.`,
    });
    if (!confirmed) return;
    const result = await executeBulkAction(selectedItems, (u: any) =>
      deleteMutation.mutateAsync({ id: u.id }),
    );
    showBulkResultToast(result, "Unités supprimées", "Erreur de suppression");
    setSelectedItems([]);
    void utils.common.unit.invalidate();
  }, [selectedItems, confirm, deleteMutation, utils]);

  const handleBulkExportCSV = useCallback(() => {
    if (selectedCount === 0) {
      toast.error("Sélectionnez au moins une unité");
      return;
    }
    exportUnitsCSV(selectedItems);
    toast.success(`${selectedCount} unité(s) exportée(s) en CSV`);
  }, [selectedCount, selectedItems]);

  const handleBulkExportExcel = useCallback(async () => {
    if (selectedCount === 0) {
      toast.error("Sélectionnez au moins une unité");
      return;
    }
    await exportUnitsExcel(selectedItems);
    toast.success(`${selectedCount} unité(s) exportée(s) en Excel`);
  }, [selectedCount, selectedItems]);

  // ---- Export all ----
  const handleExportAllCSV = useCallback(() => {
    if (items.length === 0) {
      toast.error("Aucune unité à exporter");
      return;
    }
    exportUnitsCSV(items);
    toast.success("Export CSV terminé");
  }, [items]);

  const handleExportAllExcel = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Aucune unité à exporter");
      return;
    }
    await exportUnitsExcel(items);
    toast.success("Export Excel terminé");
  }, [items]);

  const handleExportAllPDF = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Aucune unité à exporter");
      return;
    }
    await exportUnitsPDF(items);
    toast.success("Export PDF terminé");
  }, [items]);

  // ---- Columns ----
  const columns = useMemo(
    () =>
      unitsColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  // ---- TableHeader configs ----
  const handleStatusChange = useCallback((v: string) => {
    setStatusFilter((v as Status) || "");
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setPage(1);
    setSelectedItems([]);
  }, []);

  const searchConfig = useMemo(
    () =>
      createSearchField(
        searchTerm,
        (v) => {
          setSearchTerm(v);
          setPage(1);
        },
        { placeholder: "Rechercher une unité..." },
      ),
    [searchTerm],
  );

  const filtersConfig = useMemo(
    () => [
      createFilterField(
        "status",
        <SingleSelect
          btnClassName="min-w-32"
          onValueChange={handleStatusChange}
          options={[
            { value: Status.ACTIVE, label: "Actif" },
            { value: Status.INACTIVE, label: "Inactif" },
          ]}
          placeholder="Statut"
          value={statusFilter}
        />,
      ),
    ],
    [statusFilter, handleStatusChange],
  );

  const actionsConfig = useMemo(
    () => [createResetButton(handleReset)],
    [handleReset],
  );

  const bulkActionsConfig = useMemo(() => {
    if (selectedCount === 0) return undefined;
    return {
      selectedCount,
      countLabel: `${selectedCount} unité(s) sélectionnée(s)`,
      onClose: () => setSelectedItems([]),
      actions: [
        {
          label: "Supprimer",
          icon: <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />,
          onClick: handleBulkDelete,
          tooltip: "Supprimer les unités",
          size: "sm" as const,
          variant: "destructive" as const,
        },
        {
          label: "CSV",
          icon: <HugeiconsIcon icon={FileText} className="h-4 w-4" />,
          onClick: handleBulkExportCSV,
          tooltip: "Exporter en CSV",
          size: "sm" as const,
        },
        {
          label: "Excel",
          icon: (
            <HugeiconsIcon icon={FileSpreadsheetIcon} className="h-4 w-4" />
          ),
          onClick: handleBulkExportExcel,
          tooltip: "Exporter en Excel",
          size: "sm" as const,
        },
      ],
    };
  }, [
    selectedCount,
    handleBulkDelete,
    handleBulkExportCSV,
    handleBulkExportExcel,
  ]);

  return {
    // Data
    items,
    total,
    isLoading,
    error,
    refetch,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    // Selection
    selectedItems,
    setSelectedItems,
    // Configs
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    // Export all
    handleExportAllCSV,
    handleExportAllExcel,
    handleExportAllPDF,
    // Dialog / form
    form,
    dialogOpen,
    editingId,
    isLoadingEdit,
    openCreate,
    handleDialogOpenChange,
    submitForm,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    // Confirm dialog
    ConfirmDialogComponent,
  };
}
