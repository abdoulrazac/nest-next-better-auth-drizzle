"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { FormTextField, FormActions } from "@/components/form";
import { cn } from "@/lib/utils";
import { permissionGroups, permissionList } from "@/lib/permissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createRoleSchema, type RoleFormValues } from "./schema";
import { useCreateRole, useUpdateRole } from "./hooks";
import type { OrgRole } from "./types";

// ── Helper ────────────────────────────────────────────────────────────────────

function getCheckboxState(
  selectedCount: number,
  totalCount: number,
): boolean | "indeterminate" {
  if (selectedCount === 0) return false;
  if (selectedCount === totalCount) return true;
  return "indeterminate";
}

// ── PermissionCheckbox ────────────────────────────────────────────────────────

interface PermissionCheckboxProps {
  resourceKey: string;
  action: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PermissionCheckbox({
  resourceKey,
  action,
  checked,
  onChange,
}: PermissionCheckboxProps) {
  const id = `perm-${resourceKey}-${action}`;
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <FieldLabel htmlFor={id} className="font-normal cursor-pointer">
        {action}
      </FieldLabel>
    </Field>
  );
}

// ── PermissionResource ────────────────────────────────────────────────────────

interface PermissionResourceProps {
  resourceKey: string;
  resource: (typeof permissionList)[string];
  form: ReturnType<typeof useForm<RoleFormValues>>;
}

function PermissionResource({
  resourceKey,
  resource,
  form,
}: PermissionResourceProps) {
  const permission = useWatch({
    control: form.control,
    name: "permission",
    defaultValue: {},
  });

  const handleChange = useCallback(
    (action: string, checked: boolean) => {
      const current = form.getValues("permission") ?? {};
      const currentActions = current[resourceKey] ?? [];

      let updated: Record<string, string[]>;
      if (checked) {
        updated = { ...current, [resourceKey]: [...currentActions, action] };
      } else {
        const filtered = currentActions.filter((a) => a !== action);
        if (filtered.length === 0) {
          const { [resourceKey]: _removed, ...rest } = current;
          updated = rest;
        } else {
          updated = { ...current, [resourceKey]: filtered };
        }
      }
      form.setValue("permission", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, resourceKey],
  );

  const checkboxState = useMemo(() => {
    const current = permission?.[resourceKey] ?? [];
    const selectedCount = current.filter((a) =>
      resource.actions.includes(a),
    ).length;
    return getCheckboxState(selectedCount, resource.actions.length);
  }, [permission, resourceKey, resource.actions]);

  const toggleAll = useCallback(() => {
    const current = form.getValues("permission") ?? {};
    const updated = { ...current };
    if (checkboxState === true) {
      delete updated[resourceKey];
    } else {
      updated[resourceKey] = [...resource.actions];
    }
    form.setValue("permission", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [form, resourceKey, resource.actions, checkboxState]);

  const isIndeterminate = checkboxState === "indeterminate";

  return (
    <FieldSet className="border-2 rounded-lg px-4 pb-3">
      <FieldLegend className="flex items-center gap-2 bg-border px-2 py-0.5 rounded-sm">
        <Checkbox
          checked={checkboxState}
          onCheckedChange={() => toggleAll()}
          className={cn("bg-background border-primary/50", {
            "data-[state=indeterminate]:border-primary": isIndeterminate,
          })}
        />
        <span className="font-medium text-sm">{resource.title}</span>
      </FieldLegend>
      <FieldDescription className="px-1 mb-2 -mt-1">
        {resource.description}
      </FieldDescription>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
        {resource.actions.map((action) => (
          <PermissionCheckbox
            key={action}
            resourceKey={resourceKey}
            action={action}
            checked={permission?.[resourceKey]?.includes(action) ?? false}
            onChange={(checked) => handleChange(action, checked)}
          />
        ))}
      </div>
    </FieldSet>
  );
}

// ── PermissionGroup ───────────────────────────────────────────────────────────

interface PermissionGroupProps {
  groupKey: string;
  group: (typeof permissionGroups)[string];
  form: ReturnType<typeof useForm<RoleFormValues>>;
}

function PermissionGroup({ groupKey, group, form }: PermissionGroupProps) {
  const resources = useMemo(
    () =>
      Object.entries(permissionList).filter(
        ([, res]) => res.group === groupKey,
      ),
    [groupKey],
  );

  return (
    <AccordionItem value={groupKey} className="border-2 px-6 rounded-lg">
      <AccordionTrigger className="gap-3">
        <div className="flex flex-col flex-1 text-left">
          <span className="font-semibold">{group.title}</span>
          <span className="text-sm text-muted-foreground font-normal">
            {group.description}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        {resources.map(([resourceKey, resource]) => (
          <PermissionResource
            key={resourceKey}
            resourceKey={resourceKey}
            resource={resource}
            form={form}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

// ── MutateRoleDialog ──────────────────────────────────────────────────────────

interface MutateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: OrgRole | null;
}

export function MutateRoleDialog({
  open,
  onOpenChange,
  role,
}: MutateRoleDialogProps) {
  const isEdit = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleSchema as any) as any,
    defaultValues: { role: "", permission: {} },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        role: role?.role ?? "",
        permission: role?.permission ?? {},
      });
    }
  }, [open, role, form]);

  const isPending = createRole.isPending || updateRole.isPending;

  async function onSubmit(values: RoleFormValues) {
    const permission = values.permission ?? {};
    if (isEdit && role) {
      await updateRole.mutateAsync({
        id: role.id,
        data: {
          roleName: values.role !== role.role ? values.role : undefined,
          permission,
        },
      });
    } else {
      await createRole.mutateAsync({ role: values.role, permission });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[90vh] sm:max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>
            {isEdit ? "Modifier le rôle" : "Nouveau rôle"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Role name */}
            <FormTextField
              form={form}
              name="role"
              label="Nom du rôle"
              placeholder="ex. éditeur"
              disabled={isEdit}
              required
            />

            {/* Permissions */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold">Permissions associées</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sélectionnez les permissions à attribuer à ce rôle.
                </p>
              </div>
              <Accordion
                type="multiple"
                defaultValue={Object.keys(permissionGroups)}
                className="flex flex-col gap-4"
              >
                {Object.entries(permissionGroups).map(([key, group]) => (
                  <PermissionGroup
                    key={key}
                    groupKey={key}
                    group={group}
                    form={form}
                  />
                ))}
              </Accordion>
            </div>
          </div>

          <FormActions
            variant="dialog"
            isLoading={isPending}
            submitLabel={isEdit ? "Mettre à jour" : "Créer le rôle"}
            submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
            onCancel={() => onOpenChange(false)}
            onReset={() => form.reset()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
