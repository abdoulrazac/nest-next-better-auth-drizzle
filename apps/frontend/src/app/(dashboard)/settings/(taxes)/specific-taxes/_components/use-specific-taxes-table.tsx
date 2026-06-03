// @ts-nocheck
"use client";

import SingleSelect from "@/components/single-select";
import {
  createBulkActions,
  createBulkDelete,
  createFilterField,
  createResetButton,
  createSearchField,
} from "@/components/table-header";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/hooks/use-confirm-dialog";
import { api } from "@/trpc/react";
import { Status } from "@/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type SpecificTaxFormValues,
  specificTaxDefaultValues,
  specificTaxSchema,
} from "./specific-tax-form";
import { specificTaxesColumns } from "./specific-taxes-table";

export function useSpecificTaxesTable() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SpecificTaxFormValues>({
    resolver: zodResolver(specificTaxSchema) as any,
    defaultValues: specificTaxDefaultValues,
  });

  const { data, isLoading, error } = api.common.specificTax.getAll.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const { data: editingItem, isLoading: isLoadingEdit } =
    api.common.specificTax.getById.useQuery(
      { id: editingId! },
      { enabled: Boolean(editingId) },
    );

  useEffect(() => {
    if (editingId && editingItem) {
      form.reset({
        name: (editingItem as any).name ?? "",
        rate: Number((editingItem as any).rate ?? 0),
        description: (editingItem as any).description ?? "",
        status:
          (editingItem as any).status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      });
    }
  }, [editingItem, editingId, form]);

  const deleteMutation = api.common.specificTax.delete.useMutation({
    onSuccess: () => {
      void utils.common.specificTax.invalidate();
      toast.success("Taxe spécifique supprimée.");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleStatusMutation = api.common.specificTax.toggleStatus.useMutation({
    onSuccess: () => {
      void utils.common.specificTax.invalidate();
      toast.success("Statut modifié.");
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = api.common.specificTax.create.useMutation({
    onSuccess: () => {
      toast.success("Taxe spécifique créée.");
      setDialogOpen(false);
      form.reset(specificTaxDefaultValues);
      void utils.common.specificTax.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.common.specificTax.update.useMutation({
    onSuccess: () => {
      toast.success("Taxe spécifique modifiée.");
      setDialogOpen(false);
      setEditingId(null);
      form.reset(specificTaxDefaultValues);
      void utils.common.specificTax.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(specificTaxDefaultValues);
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
        form.reset(specificTaxDefaultValues);
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: SpecificTaxFormValues) => {
      const payload = {
        ...values,
        name: values.name.trim(),
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

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm(
        confirmDialogPresets.delete("cette taxe spécifique"),
      );
      if (confirmed) deleteMutation.mutate({ id });
    },
    [confirm, deleteMutation],
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      toggleStatusMutation.mutate({ id });
    },
    [toggleStatusMutation],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error("Aucune taxe sélectionnée");
      return;
    }
    const confirmed = await confirm(
      confirmDialogPresets.delete(
        `${selectedItems.length} taxe(s) spécifique(s)`,
      ),
    );
    if (!confirmed) return;
    for (const item of selectedItems) {
      deleteMutation.mutate({ id: item.id });
    }
    setSelectedItems([]);
  }, [selectedItems, confirm, deleteMutation]);

  const columns = useMemo(
    () =>
      specificTaxesColumns({
        onEdit: openEdit,
        onDelete: handleDelete,
        onToggleStatus: handleToggleStatus,
      }),
    [openEdit, handleDelete, handleToggleStatus],
  );

  const searchConfig = useMemo(
    () =>
      createSearchField(
        searchTerm,
        (v) => {
          setSearchTerm(v);
          setPage(1);
        },
        { placeholder: "Rechercher une taxe…" },
      ),
    [searchTerm],
  );

  const filtersConfig = useMemo(
    () => [
      createFilterField(
        "status",
        <SingleSelect
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as "" | Status);
            setPage(1);
          }}
          options={[
            { value: "ACTIVE", label: "Actif" },
            { value: "INACTIVE", label: "Inactif" },
          ]}
          placeholder="Tous les statuts"
        />,
      ),
    ],
    [statusFilter],
  );

  const actionsConfig = useMemo(
    () => [
      createResetButton(
        () => {
          setSearchTerm("");
          setStatusFilter("");
          setPage(1);
        },
        { disabled: !searchTerm && !statusFilter },
      ),
    ],
    [searchTerm, statusFilter],
  );

  const bulkActionsConfig = useMemo(
    () =>
      createBulkActions(selectedItems.length, [
        createBulkDelete(handleBulkDelete, {
          label: `Supprimer (${selectedItems.length})`,
        }),
      ]),
    [selectedItems, handleBulkDelete],
  );

  return {
    items,
    total,
    isLoading,
    error,
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
