// @ts-nocheck
"use client";

import { createSearchField } from "@/components/table-header";
import {
  confirmDialogPresets,
  useConfirmDialog,
} from "@/hooks/use-confirm-dialog";
import {
  createFiscalYearSchema,
  type CreateFiscalYearInput,
} from "@/server/api/settings/schemas/fiscal-year.schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  fiscalYearDefaultValues,
  fiscalYearToFormValues,
} from "./fiscal-year-form";
import { fiscalYearsColumns } from "./fiscal-years-table";

export function useFiscalYears() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const utils = api.useUtils();

  // ── Filters / pagination ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Dialog / form state ───────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CreateFiscalYearInput>({
    resolver: zodResolver(createFiscalYearSchema) as any,
    defaultValues: fiscalYearDefaultValues(),
  });

  // ── Query ─────────────────────────────────────────────────────
  const { data, isLoading, error } = api.settings.fiscalYear.getAll.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: searchTerm || undefined,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  // ── Edit data fetch ───────────────────────────────────────────
  const { data: editingFY, isLoading: isLoadingEdit } =
    api.settings.fiscalYear.getById.useQuery(
      { id: editingId! },
      { enabled: Boolean(editingId) },
    );

  useEffect(() => {
    if (editingId && editingFY) {
      form.reset(fiscalYearToFormValues(editingFY as Record<string, any>));
    }
  }, [editingFY, editingId, form]);

  // ── Mutations ─────────────────────────────────────────────────
  const createMutation = api.settings.fiscalYear.create.useMutation({
    onSuccess: () => {
      toast.success("Exercice fiscal créé.");
      setDialogOpen(false);
      form.reset(fiscalYearDefaultValues());
      void utils.settings.fiscalYear.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.settings.fiscalYear.update.useMutation({
    onSuccess: () => {
      toast.success("Exercice fiscal modifié.");
      setDialogOpen(false);
      setEditingId(null);
      form.reset(fiscalYearDefaultValues());
      void utils.settings.fiscalYear.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = api.settings.fiscalYear.delete.useMutation({
    onSuccess: () => {
      toast.success("Exercice fiscal supprimé.");
      void utils.settings.fiscalYear.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const closeMutation = api.settings.fiscalYear.close.useMutation({
    onSuccess: () => {
      toast.success("Exercice fiscal clôturé.");
      void utils.settings.fiscalYear.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const setDefaultMutation = api.settings.fiscalYear.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Exercice fiscal défini comme exercice actif.");
      void utils.settings.fiscalYear.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Dialog handlers ───────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(fiscalYearDefaultValues());
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
        form.reset(fiscalYearDefaultValues());
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: CreateFiscalYearInput) => {
      const payload = {
        label: values.label.trim(),
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        isDefault: values.isDefault,
        notes: values.notes || undefined,
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

  // ── Row action handlers ───────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await confirm(
        confirmDialogPresets.delete("cet exercice fiscal"),
      );
      if (ok) deleteMutation.mutate({ id });
    },
    [confirm, deleteMutation],
  );

  const handleClose = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "Clôturer l'exercice fiscal ?",
        description:
          "Cette action est irréversible. L'exercice ne pourra plus être modifié.",
        confirmLabel: "Clôturer",
        variant: "destructive",
      });
      if (ok) closeMutation.mutate({ id });
    },
    [confirm, closeMutation],
  );

  const handleSetDefault = useCallback(
    (id: string) => {
      setDefaultMutation.mutate({ id });
    },
    [setDefaultMutation],
  );

  // ── Columns ───────────────────────────────────────────────────
  const columns = fiscalYearsColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
    onClose: handleClose,
    onSetDefault: handleSetDefault,
  });

  // ── Search / filter config ────────────────────────────────────
  const searchConfig = createSearchField(
    searchTerm,
    (v: string) => {
      setSearchTerm(v);
      setPage(1);
    },
    { placeholder: "Rechercher un exercice..." },
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    items,
    total,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    columns,
    searchConfig,
    form,
    dialogOpen,
    editingId,
    isLoadingEdit,
    openCreate,
    handleDialogOpenChange,
    submitForm,
    isSubmitting,
    ConfirmDialogComponent,
  };
}
