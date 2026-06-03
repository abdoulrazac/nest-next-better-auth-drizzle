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
  type TaxRateFormValues,
  taxRateDefaultValues,
  taxRateSchema,
} from "./tax-rate-form";
import { taxRatesColumns } from "./tax-rates-table";
import {
  exportTaxRatesCSV,
  exportTaxRatesExcel,
  exportTaxRatesPDF,
} from "./use-tax-rates-export";

type ConfirmFn = ReturnType<typeof useConfirmDialog>["confirm"];

interface UseTaxRatesTableOptions {}

function mapTypeToCode(type?: string): string {
  if (type === "REDUCED") return "REDUCED";
  if (type === "EXEMPT") return "EXEMPT";
  return "NORMAL";
}

export function useTaxRatesTable({}: UseTaxRatesTableOptions = {}) {
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

  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema) as any,
    defaultValues: taxRateDefaultValues,
  });

  // ---- Query ----
  const { data, isLoading, error, refetch } =
    api.common.taxRate.getAll.useQuery({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  // ---- Edit data fetch ----
  const { data: editingTaxRate, isLoading: isLoadingEdit } =
    api.common.taxRate.getById.useQuery(
      { id: editingId! },
      { enabled: Boolean(editingId) },
    );

  useEffect(() => {
    if (editingId && editingTaxRate) {
      form.reset({
        name: (editingTaxRate as any).label ?? "",
        rate: Number((editingTaxRate as any).rate ?? 0),
        code: mapTypeToCode((editingTaxRate as any).type),
        description: "",
        isDefault: Boolean((editingTaxRate as any).isDefault),
        status:
          (editingTaxRate as any).status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        taxGroup: (editingTaxRate as any).taxGroup ?? undefined,
      });
    }
  }, [editingTaxRate, editingId, form]);

  // ---- Mutations ----
  const deleteMutation = api.common.taxRate.delete.useMutation({
    onSuccess: () => {
      void utils.common.taxRate.invalidate();
      toast.success("Taux de TVA supprimé.");
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = api.common.taxRate.create.useMutation({
    onSuccess: () => {
      toast.success("Taux de TVA créé.");
      setDialogOpen(false);
      form.reset(taxRateDefaultValues);
      void utils.common.taxRate.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.common.taxRate.update.useMutation({
    onSuccess: () => {
      toast.success("Taux de TVA modifié.");
      setDialogOpen(false);
      setEditingId(null);
      form.reset(taxRateDefaultValues);
      void utils.common.taxRate.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ---- Dialog handlers ----
  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(taxRateDefaultValues);
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
        form.reset(taxRateDefaultValues);
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: TaxRateFormValues) => {
      const payload = {
        ...values,
        name: values.name.trim(),
        code: values.code || undefined,
        description: values.description || undefined,
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
        confirmDialogPresets.delete("ce taux de TVA"),
      );
      if (confirmed) deleteMutation.mutate({ id });
    },
    [confirm, deleteMutation],
  );

  // ---- Bulk actions ----
  const selectedCount = selectedItems.length;

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error("Aucun taux sélectionné");
      return;
    }
    const confirmed = await confirm({
      ...confirmDialogPresets.delete(),
      title: `Supprimer ${selectedItems.length} taux de TVA`,
      description: `Êtes-vous sûr de vouloir supprimer les ${selectedItems.length} taux de TVA sélectionnés ? Cette action est irréversible.`,
    });
    if (!confirmed) return;
    const result = await executeBulkAction(selectedItems, (t: any) =>
      deleteMutation.mutateAsync({ id: t.id }),
    );
    showBulkResultToast(result, "Taux supprimés", "Erreur de suppression");
    setSelectedItems([]);
    void utils.common.taxRate.invalidate();
  }, [selectedItems, confirm, deleteMutation, utils]);

  const handleBulkExportCSV = useCallback(() => {
    if (selectedCount === 0) {
      toast.error("Sélectionnez au moins un taux");
      return;
    }
    exportTaxRatesCSV(selectedItems);
    toast.success(`${selectedCount} taux exporté(s) en CSV`);
  }, [selectedCount, selectedItems]);

  const handleBulkExportExcel = useCallback(async () => {
    if (selectedCount === 0) {
      toast.error("Sélectionnez au moins un taux");
      return;
    }
    await exportTaxRatesExcel(selectedItems);
    toast.success(`${selectedCount} taux exporté(s) en Excel`);
  }, [selectedCount, selectedItems]);

  // ---- Export all ----
  const handleExportAllCSV = useCallback(() => {
    if (items.length === 0) {
      toast.error("Aucun taux à exporter");
      return;
    }
    exportTaxRatesCSV(items);
    toast.success("Export CSV terminé");
  }, [items]);

  const handleExportAllExcel = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Aucun taux à exporter");
      return;
    }
    await exportTaxRatesExcel(items);
    toast.success("Export Excel terminé");
  }, [items]);

  const handleExportAllPDF = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Aucun taux à exporter");
      return;
    }
    await exportTaxRatesPDF(items);
    toast.success("Export PDF terminé");
  }, [items]);

  // ---- Columns ----
  const columns = useMemo(
    () =>
      taxRatesColumns({
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
        { placeholder: "Rechercher un taux..." },
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
      countLabel: `${selectedCount} taux sélectionné(s)`,
      onClose: () => setSelectedItems([]),
      actions: [
        {
          label: "Supprimer",
          icon: <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />,
          onClick: handleBulkDelete,
          tooltip: "Supprimer les taux",
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
