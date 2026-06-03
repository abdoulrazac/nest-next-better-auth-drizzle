// @ts-nocheck
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";
import {
  permissionGroups,
  permissionList,
} from "@/server/better-auth/permission";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingIcon, Save } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ==================== Types & Schema ====================
interface RoleFormProps {
  role?: {
    id: string;
    role: string;
    description?: string | null;
    color?: string | null;
    permission?: Record<string, string[]>;
  };
  onSuccess?: () => void;
}

const formSchema = z.object({
  role: z
    .string()
    .min(2, { message: "Le nom du rôle doit contenir au moins 2 caractères." }),
  description: z.string().max(255).optional(),
  permission: z.record(z.string(), z.array(z.string())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ==================== Sub-Components ====================

// Helper pour calculer l'état indéterminé de la checkbox
function getCheckboxState(
  selectedCount: number,
  totalCount: number,
): boolean | "indeterminate" {
  if (selectedCount === 0) return false;
  if (selectedCount === totalCount) return true;
  return "indeterminate";
}

interface SelectAllCheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

function SelectAllCheckbox({
  checked,
  onCheckedChange,
  label,
}: SelectAllCheckboxProps) {
  const isIndeterminate = checked === "indeterminate";

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(!!c)}
        className={cn("bg-background border-primary/50", {
          "data-[state=indeterminate]:border-primary": isIndeterminate,
        })}
      />
      {label && (
        <FieldLabel className="font-normal text-sm">{label}</FieldLabel>
      )}
    </div>
  );
}

interface PermissionCheckboxProps {
  subKey: string;
  permission: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PermissionCheckbox({
  subKey,
  permission,
  checked,
  onChange,
}: PermissionCheckboxProps) {
  const checkboxId = `permission-${subKey}-${permission}-checkbox`;

  return (
    <FieldGroup className="flex flex-wrap gap-3">
      <Field orientation="horizontal">
        <Checkbox
          id={checkboxId}
          name={checkboxId}
          checked={checked}
          onCheckedChange={onChange}
        />
        <FieldLabel htmlFor={checkboxId} className="font-normal">
          {permission}
        </FieldLabel>
      </Field>
    </FieldGroup>
  );
}

interface PermissionSubGroupProps {
  subKey: string;
  subGroup: (typeof permissionList)[string];
  form: ReturnType<typeof useForm<FormValues>>;
}

function PermissionSubGroup({
  subKey,
  subGroup,
  form,
}: PermissionSubGroupProps) {
  const permissions = useWatch({
    control: form.control,
    name: "permission",
    defaultValue: {},
  });

  const handlePermissionChange = useCallback(
    (permission: string, checked: boolean) => {
      const currentPerms = form.getValues("permission") || {};
      const currentSubPerms = currentPerms[subKey] || [];

      let updatedPerms: Record<string, string[]>;

      if (checked) {
        updatedPerms = {
          ...currentPerms,
          [subKey]: [...currentSubPerms, permission],
        };
      } else {
        const filteredPerms = currentSubPerms.filter((p) => p !== permission);

        if (filteredPerms.length === 0) {
          const { [subKey]: _, ...rest } = currentPerms;
          updatedPerms = rest;
        } else {
          updatedPerms = {
            ...currentPerms,
            [subKey]: filteredPerms,
          };
        }
      }

      form.setValue("permission", updatedPerms, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, subKey],
  );

  // Calculer l'état de la checkbox du sous-groupe
  const checkboxState = useMemo(() => {
    const currentSubPerms = permissions?.[subKey] || [];
    const selectedCount = currentSubPerms.filter((perm) =>
      subGroup.permissions.includes(perm),
    ).length;
    return getCheckboxState(selectedCount, subGroup.permissions.length);
  }, [permissions, subKey, subGroup.permissions]);

  // Sélectionner/désélectionner toutes les permissions du sous-groupe
  const toggleAll = useCallback(() => {
    const currentPerms = form.getValues("permission") || {};
    const newPerms = { ...currentPerms };

    if (checkboxState === true) {
      // Désélectionner tout pour ce sous-groupe
      delete newPerms[subKey];
    } else {
      // Sélectionner tout pour ce sous-groupe
      newPerms[subKey] = [...subGroup.permissions];
    }

    form.setValue("permission", newPerms, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [form, subKey, subGroup.permissions, checkboxState]);

  return (
    <FieldSet className="shadow-sm px-4 border-2 rounded-lg">
      <FieldLegend className="flex bg-border px-2 gap-2 rounded-sm">
        <SelectAllCheckbox
          checked={checkboxState}
          onCheckedChange={toggleAll}
        />
        {subGroup.title}
      </FieldLegend>
      <FieldDescription className="px-2 mb-1! ">
        {subGroup.description}
      </FieldDescription>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2 -mt-3! h-fit ">
        {subGroup.permissions.map((perm) => (
          <PermissionCheckbox
            key={perm}
            subKey={subKey}
            permission={perm}
            checked={permissions?.[subKey]?.includes(perm) || false}
            onChange={(checked) => handlePermissionChange(perm, checked)}
          />
        ))}
      </div>
    </FieldSet>
  );
}

interface PermissionGroupProps {
  groupKey: string;
  group: (typeof permissionGroups)[string];
  form: ReturnType<typeof useForm<FormValues>>;
}

function PermissionGroup({ groupKey, group, form }: PermissionGroupProps) {
  const groupItems = useMemo(
    () =>
      Object.entries(permissionList).filter(
        ([_, per]: [string, any]) => per.group === groupKey,
      ),
    [groupKey],
  );

  return (
    <AccordionItem value={groupKey} className="border-2 px-6 rounded-lg">
      <AccordionTrigger className="gap-3 hover:pointer">
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-xl">{group.title}</h3>
          <span className="text-muted-foreground">{group.description}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {groupItems.map(([subKey, subGroup]) => (
          <PermissionSubGroup
            key={subKey}
            subKey={subKey}
            subGroup={subGroup}
            form={form}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

interface FormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
  onReset: () => void;
}

function FormActions({ isSubmitting, isEditMode, onReset }: FormActionsProps) {
  return (
    <div className="flex flex-col justify-end sm:flex-row gap-3 sm:gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto order-2 sm:order-1"
        disabled={isSubmitting}
        onClick={onReset}
      >
        Réinitialiser
      </Button>
      <Button
        type="submit"
        className="order-1 sm:order-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon
              icon={LoadingIcon}
              className="mr-2 h-4 w-4 animate-spin"
            />
            {isEditMode ? "Mise à jour..." : "Création..."}
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Save} className="h-4 w-4" />
            {isEditMode ? "Mettre à jour" : "Créer le rôle"}
          </>
        )}
      </Button>
    </div>
  );
}

interface PermissionsSectionProps {
  form: ReturnType<typeof useForm<FormValues>>;
}

function PermissionsSection({ form }: PermissionsSectionProps) {
  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Permissions associées</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les permissions à attribuer à ce rôle.
        </p>
      </div>
      <Accordion type="multiple" className="w-full flex flex-col gap-6">
        {Object.entries(permissionGroups).map(([key, group]) => (
          <PermissionGroup key={key} groupKey={key} group={group} form={form} />
        ))}
      </Accordion>
    </div>
  );
}

// ==================== Main Component ====================

export default function RoleForm({ role, onSuccess }: RoleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!role;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      role: role?.role || "",
      description: role?.description || "",
      permission: role?.permission || {},
    },
  });

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      setIsSubmitting(true);
      try {
        if (isEditMode) {
          // @ts-expect-error - endpoint pas encore typé pour la mise à jour de rôle
          await authClient.organization.updateRole({
            roleName: role!.role,
            data: {
              permission: data.permission,
              description: data.description,
            },
          });
          toast.success("Rôle mis à jour avec succès.");
          router.push("/accounts/roles");
        } else {
          // @ts-expect-error - endpoint pas encore typé pour la création de rôle
          await authClient.organization.createRole({
            role: data.role,
            permission: data.permission,
            additionalFields: {
              description: data.description,
            },
          });
          toast.success("Rôle créé avec succès.");
        }
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/accounts/roles");
        }
      } catch (error) {
        toast.error("Une erreur est survenue.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, role?.role, router, onSuccess],
  );

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FieldGroup>
          {/* Role Name */}
          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="role">Rôle *</FieldLabel>
                <Input
                  {...field}
                  id="role"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nom du rôle"
                  disabled={isEditMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  {...field}
                  id="description"
                  aria-invalid={fieldState.invalid}
                  placeholder="Description du rôle"
                  rows={3}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Permissions */}
        <PermissionsSection form={form} />

        {/* Actions */}
        <FormActions
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          onReset={() => form.reset()}
        />
      </form>
    </div>
  );
}
