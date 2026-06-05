"use client";

import { FormActions, FormTextField } from "@/components/form";
import { FormSection } from "@/components/form/form-section";
import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { permissionGroups, permissionList } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useCreateRole, useGetPermissions, useUpdateRole } from "./hooks";
import { createRoleSchema, type RoleFormValues } from "./schema";
import type { OrgRole } from "./types";

// ── Helper ────────────────────────────────────────────────────────────────────

function getCheckboxState(
  selected: number,
  total: number,
): boolean | "indeterminate" {
  if (selected === 0) return false;
  if (selected === total) return true;
  return "indeterminate";
}

// ── PermissionCheckbox ────────────────────────────────────────────────────────

function PermissionCheckbox({
  resourceKey,
  action,
  checked,
  onChange,
}: {
  resourceKey: string;
  action: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
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

function PermissionResource({
  resourceKey,
  availableActions,
  form,
}: {
  resourceKey: string;
  /** Actions exposed by the backend for this resource */
  availableActions: string[];
  form: ReturnType<typeof useForm<RoleFormValues>>;
}) {
  const meta = permissionList[resourceKey];
  const title = meta?.title ?? resourceKey;
  const description = meta?.description;

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
      availableActions.includes(a),
    ).length;
    return getCheckboxState(selectedCount, availableActions.length);
  }, [permission, resourceKey, availableActions]);

  const toggleAll = useCallback(() => {
    const current = form.getValues("permission") ?? {};
    const updated = { ...current };
    if (checkboxState === true) {
      delete updated[resourceKey];
    } else {
      updated[resourceKey] = [...availableActions];
    }
    form.setValue("permission", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [form, resourceKey, availableActions, checkboxState]);

  return (
    <FieldSet className="border-2 rounded-lg px-4 pb-3">
      <FieldLegend className="flex items-center gap-2 bg-border px-2 py-0.5 rounded-sm">
        <Checkbox
          checked={checkboxState}
          onCheckedChange={() => toggleAll()}
          className={cn("bg-background border-primary/50", {
            "data-[state=indeterminate]:border-primary":
              checkboxState === "indeterminate",
          })}
        />
        <span className="font-medium text-sm">{title}</span>
      </FieldLegend>
      {description && (
        <FieldDescription className="px-1 mb-2 -mt-1">
          {description}
        </FieldDescription>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
        {availableActions.map((action) => (
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

function PermissionGroup({
  groupKey,
  group,
  backendPermissions,
  form,
}: {
  groupKey: string;
  group: (typeof permissionGroups)[string];
  backendPermissions: Record<string, string[]>;
  form: ReturnType<typeof useForm<RoleFormValues>>;
}) {
  // Resources that belong to this group AND exist in the backend response
  const resources = useMemo(
    () =>
      Object.entries(permissionList)
        .filter(
          ([key, res]) => res.group === groupKey && key in backendPermissions,
        )
        .map(([key]) => key),
    [groupKey, backendPermissions],
  );

  if (resources.length === 0) return null;

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
        {resources.map((resourceKey) => (
          <PermissionResource
            key={resourceKey}
            resourceKey={resourceKey}
            availableActions={backendPermissions[resourceKey] ?? []}
            form={form}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

// ── RoleForm ──────────────────────────────────────────────────────────────────

export interface RoleFormProps {
  /** Provide to pre-fill the form in edit mode */
  role?: OrgRole | null;
}

export function RoleForm({ role }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!role;

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const isSubmitting = createRole.isPending || updateRole.isPending;

  const { data: backendPermissions, isLoading: permissionsLoading } =
    useGetPermissions();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleSchema as any) as any,
    defaultValues: {
      role: role?.role ?? "",
      permission: role?.permission ?? {},
    },
  });

  async function onSubmit(values: RoleFormValues) {
    if (isEdit && role) {
      await updateRole.mutateAsync({
        id: role.id,
        data: {
          roleName: values.role !== role.role ? values.role : undefined,
          permission: values.permission ?? {},
        },
      });
    } else {
      await createRole.mutateAsync({
        role: values.role,
        permission: values.permission ?? {},
      });
    }
    router.push("/accounts/roles");
  }

  const allGroupKeys = Object.keys(permissionGroups);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Modifier "${role.role}"` : "Nouveau rôle"}
        description={
          isEdit
            ? "Modifiez le nom ou les permissions de ce rôle."
            : "Définissez un nom et sélectionnez les permissions à attribuer."
        }
        backNavigation={{ href: "/accounts/roles" }}
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-5xl"
      >
        {/* ── Basic info ── */}
        <FormSection
          title="Informations générales"
          description="Identifiant unique du rôle au sein de l'organisation."
        >
          <FormTextField
            form={form}
            name="role"
            label="Nom du rôle"
            required
            placeholder="ex. éditeur"
            disabled={isEdit}
            description={
              isEdit
                ? "Le nom d'un rôle ne peut pas être modifié après création."
                : undefined
            }
          />
        </FormSection>

        {/* ── Permissions ── */}
        <FormSection
          title="Permissions associées"
          description="Sélectionnez les ressources et actions accessibles pour ce rôle."
        >
          {permissionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : backendPermissions ? (
            <Accordion
              type="multiple"
              defaultValue={allGroupKeys}
              className="flex flex-col gap-4"
            >
              {allGroupKeys.map((key) => {
                const group = permissionGroups[key];
                if (!group) return null;
                return (
                  <PermissionGroup
                    key={key}
                    groupKey={key}
                    group={group}
                    backendPermissions={backendPermissions}
                    form={form}
                  />
                );
              })}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground">
              Impossible de charger les permissions.
            </p>
          )}
        </FormSection>

        {/* ── Actions ── */}
        <FormActions
          variant="page"
          isLoading={isSubmitting}
          disabled={permissionsLoading}
          submitLabel={isEdit ? "Mettre à jour" : "Créer le rôle"}
          submitLoadingLabel={isEdit ? "Mise à jour..." : "Création..."}
          onCancel={() => router.push("/accounts/roles")}
          onReset={() => form.reset()}
        />
      </form>
    </div>
  );
}
