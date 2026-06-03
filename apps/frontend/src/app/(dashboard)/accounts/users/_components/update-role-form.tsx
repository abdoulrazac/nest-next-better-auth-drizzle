// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import type { MemberWithRelations } from "@/types/accounts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loading01Icon, UserSwitchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RoleMultiSelect } from "../../roles/_components/role-multi-select";

const formSchema = z.object({
  role: z.string().min(1, "Le rôle est requis."),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  member: MemberWithRelations | null;
  onSuccess?: () => void;
}

export default function UpdateRoleForm({
  open,
  onOpenChange,
  member,
  onSuccess,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const utils = api.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { role: member?.role ?? "" },
  });

  useEffect(() => {
    if (member) {
      form.reset({ role: member.role ?? "" });
    }
  }, [member, form]);

  const handleSubmit = useCallback(
    async (data: FormData) => {
      if (!member) return;
      setIsPending(true);
      const { error } = await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: data.role,
      });
      setIsPending(false);
      if (error) {
        toast.error(error.message || "Erreur lors de la mise à jour du rôle.");
        return;
      }
      void utils.accounts.userManagement.getMembers.invalidate();
      toast.success("Rôle mis à jour avec succès.");
      onSuccess?.();
      onOpenChange(false);
    },
    [member, onSuccess, onOpenChange, utils],
  );

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserSwitchIcon} className="h-5 w-5" />
            Modifier le rôle
          </DialogTitle>
          <DialogDescription>
            Modifier le rôle de{" "}
            <strong>{member.user?.name || member.user?.email}</strong> dans
            l'organisation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="role">Nouveau rôle *</FieldLabel>
              <RoleMultiSelect
                value={form.watch("role").split(",").filter(Boolean)}
                onValueChange={(values) =>
                  form.setValue("role", values.join(","), {
                    shouldValidate: true,
                  })
                }
                disabled={isPending}
              />
              <FieldError
                errors={
                  form.formState.errors.role ? [form.formState.errors.role] : []
                }
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? (
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="h-4 w-4 animate-spin mr-2"
                />
              ) : (
                <HugeiconsIcon icon={UserSwitchIcon} className="h-4 w-4 mr-2" />
              )}
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
