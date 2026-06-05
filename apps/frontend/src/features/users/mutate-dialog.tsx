"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormTextField, FormSelectField, FormActions } from "@/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createUserSchema, type UserFormValues } from "./schema";
import { useCreateUser, useUpdateUser } from "./hooks";
import type { User } from "./types";

interface MutateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "member", label: "Membre" },
  { value: "viewer", label: "Lecteur" },
];

export function MutateUserDialog({
  open,
  onOpenChange,
  user,
}: MutateUserDialogProps) {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema as any) as any,
    defaultValues: { name: "", email: "", role: "member" },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: (user?.role as UserFormValues["role"]) ?? "member",
      });
    }
  }, [open, user, reset]);

  const isPending = createUser.isPending || updateUser.isPending;

  async function onSubmit(values: UserFormValues) {
    if (isEdit && user) {
      await updateUser.mutateAsync({ id: user.id, data: values });
    } else {
      await createUser.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormTextField
            form={form}
            name="name"
            label="Nom"
            required
            placeholder="Nom complet"
            disabled={isPending}
          />

          <FormTextField
            form={form}
            name="email"
            label="Email"
            required
            type="email"
            placeholder="exemple@email.com"
            disabled={isEdit || isPending}
          />

          <FormSelectField
            form={form}
            name="role"
            label="Rôle"
            required
            options={ROLE_OPTIONS}
            placeholder="Choisir un rôle..."
            disabled={isPending}
          />

          <FormActions
            variant="dialog"
            isLoading={isPending}
            submitLabel={isEdit ? "Mettre à jour" : "Créer"}
            submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
