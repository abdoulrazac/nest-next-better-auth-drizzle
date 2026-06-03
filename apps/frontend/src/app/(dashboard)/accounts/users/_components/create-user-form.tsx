// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  Loading01Icon,
  UserAdd01Icon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RoleMultiSelect } from "../../roles/_components/role-multi-select";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  role: z.string().min(1, "Le rôle est requis."),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateUserForm({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { name: "", email: "", password: "", role: "" },
  });

  const createUser = api.accounts.userManagement.createUser.useMutation({
    onSuccess: () => {
      toast.success(
        "Compte utilisateur créé avec succès. L'utilisateur devra changer son mot de passe à la première connexion.",
      );
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la création du compte.");
    },
  });

  const handleSubmit = useCallback(
    (data: FormData) => {
      createUser.mutate(data);
    },
    [createUser],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
            Créer un compte utilisateur
          </DialogTitle>
          <DialogDescription>
            Le compte sera créé directement. L'utilisateur sera invité à changer
            son mot de passe à sa première connexion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom complet *</FieldLabel>
              <Input
                id="name"
                placeholder="Jean Dupont"
                disabled={createUser.isPending}
                {...form.register("name")}
              />
              <FieldError
                errors={
                  form.formState.errors.name ? [form.formState.errors.name] : []
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Adresse email *</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="jean@entreprise.com"
                disabled={createUser.isPending}
                {...form.register("email")}
              />
              <FieldError
                errors={
                  form.formState.errors.email
                    ? [form.formState.errors.email]
                    : []
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                Mot de passe par défaut *
              </FieldLabel>
              <div className="flex gap-2">
                <ButtonGroup className="w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    disabled={createUser.isPending}
                    {...form.register("password")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    <HugeiconsIcon
                      icon={showPassword ? EyeIcon : ViewOffSlashIcon}
                      className="h-4 w-4"
                    />
                  </Button>
                </ButtonGroup>
              </div>
              <FieldError
                errors={
                  form.formState.errors.password
                    ? [form.formState.errors.password]
                    : []
                }
              />
              <p className="text-muted-foreground text-xs mt-1">
                L'utilisateur sera obligé de changer ce mot de passe à sa
                première connexion.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Rôle *</FieldLabel>
              <RoleMultiSelect
                value={form.watch("role").split(",").filter(Boolean)}
                onValueChange={(values) =>
                  form.setValue("role", values.join(","), {
                    shouldValidate: true,
                  })
                }
                disabled={createUser.isPending}
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
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
              disabled={createUser.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending || !form.formState.isValid}
            >
              {createUser.isPending ? (
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="h-4 w-4 animate-spin mr-2"
                />
              ) : (
                <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4 mr-2" />
              )}
              Créer le compte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
