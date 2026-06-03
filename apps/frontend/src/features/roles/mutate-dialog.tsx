"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormSection } from "@/components/form-section";
import { createRoleSchema, type RoleFormValues } from "./schema";
import { useCreateRole, useUpdateRole } from "./hooks";
import type { Role } from "./types";

interface MutateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

export function MutateRoleDialog({
  open,
  onOpenChange,
  role,
}: MutateRoleDialogProps) {
  const isEdit = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues & { _permissionsRaw?: string }>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", permissions: [], _permissionsRaw: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: role?.name ?? "",
        permissions: role?.permissions ?? [],
        _permissionsRaw: role?.permissions?.join(", ") ?? "",
      });
    }
  }, [open, role, reset]);

  const isPending = createRole.isPending || updateRole.isPending;

  async function onSubmit(
    values: RoleFormValues & { _permissionsRaw?: string },
  ) {
    const permissions = values._permissionsRaw
      ? values._permissionsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : values.permissions;

    const payload = { name: values.name, permissions };

    if (isEdit && role) {
      await updateRole.mutateAsync({ id: role.id, data: payload });
    } else {
      await createRole.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "New Role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSection title="Details">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g. Editor"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-permissions">Permissions</Label>
                <Textarea
                  id="role-permissions"
                  placeholder="read:users, write:users, delete:users"
                  defaultValue={role?.permissions?.join(", ") ?? ""}
                  {...register("_permissionsRaw")}
                  rows={3}
                />
                {errors.permissions && (
                  <p className="text-xs text-destructive">
                    {errors.permissions.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Comma-separated permission strings
                </p>
              </div>
            </div>
          </FormSection>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
