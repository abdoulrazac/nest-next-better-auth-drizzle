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
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type PsvbRateFormValues,
  psvbRateDefaultValues,
  psvbRateSchema,
} from "./psvb-rate-form";
import { psvbRatesColumns } from "./psvb-rates-table";

export function usePsvbRatesTable() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<PsvbRateFormValues>({
    resolver: zodResolver(psvbRateSchema) as any,
    defaultValues: psvbRateDefaultValues,
  });

  const { data, isLoading, error, refetch } =
    api.common.psvbRate.getAll.useQuery({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const { data: editingRate, isLoading: isLoadingEdit } =
    api.common.psvbRate.getById.useQuery(
      { id: editingId! },
      { enabled: Boolean(editingId) },
    );

  useEffect(() => {
    if (editingId && editingRate) {
      form.reset({
        label: (editingRate as any).label ?? "",
        group: (editingRate as any).group ?? "A",
        rate: Number((editingRate as any).rate ?? 0),
        isDefault: Boolean((editingRate as any).isDefault),
        status:
          (editingRate as any).status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        description: (editingRate as any).description ?? "",
      });
    }
  }, [editingRate, editingId, form]);

  const deleteMutation = api.common.psvbRate.delete.useMutation({
    onSuccess: () => {
      void utils.common.psvbRate.invalidate();
      toast.success("Taux PSVB supprimé.");
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = api.common.psvbRate.create.useMutation({
    onSuccess: () => {
      toast.success("Taux PSVB créé.");
      setDialogOpen(false);
      form.reset(psvbRateDefaultValues);
      void utils.common.psvbRate.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.common.psvbRate.update.useMutation({
    onSuccess: () => {
      toast.success("Taux PSVB modifié.");
      setDialogOpen(false);
      setEditingId(null);
      form.reset(psvbRateDefaultValues);
      void utils.common.psvbRate.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(psvbRateDefaultValues);
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
        form.reset(psvbRateDefaultValues);
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: PsvbRateFormValues) => {
      const payload = {
        ...values,
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

  const handleEdit = useCallback((id: string) => openEdit(id), [openEdit]);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm(
        confirmDialogPresets.delete("ce taux PSVB"),
      );
      if (confirmed) deleteMutation.mutate({ id });
    },
    [confirm, deleteMutation],
  );

  const selectedCount = selectedItems.length;

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error("Aucun taux sélectionné");
      return;
    }
    const confirmed = await confirm({
      ...confirmDialogPresets.delete(),
      title: `Supprimer ${selectedItems.length} taux PSVB`,
      description: `Êtes-vous sûr de vouloir supprimer les ${selectedItems.length} taux PSVB sélectionnés ? Cette action est irréversible.`,
    });
    if (!confirmed) return;
    const result = await executeBulkAction(selectedItems, (t: any) =>
      deleteMutation.mutateAsync({ id: t.id }),
    );
    showBulkResultToast(result, "Taux supprimés", "Erreur de suppression");
    setSelectedItems([]);
    void utils.common.psvbRate.invalidate();
  }, [selectedItems, confirm, deleteMutation, utils]);

  const columns = useMemo(
    () =>
      psvbRatesColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

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
        { placeholder: "Rechercher un taux PSVB..." },
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
      ],
    };
  }, [selectedCount, handleBulkDelete]);

  return {
    items,
    total,
    isLoading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedItems,
    setSelectedItems,
    columns,
    searchConfig,
    filtersConfig,
    actionsConfig,
    bulkActionsConfig,
    form,
    dialogOpen,
    editingId,
    isLoadingEdit,
    openCreate,
    handleDialogOpenChange,
    submitForm,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    ConfirmDialogComponent,
  };
}
