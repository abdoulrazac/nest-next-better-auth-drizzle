// @ts-nocheck
import { HugeiconsIcon } from "@hugeicons/react";

import { ButtonTooltip } from "@/components/button-tooltip";
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
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/better-auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CancelCircleIcon,
  Loading01Icon,
  MailIcon,
  SentIcon,
  UserCheckIcon,
} from "@hugeicons/core-free-icons";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RoleMultiSelect } from "../../roles/_components/role-multi-select";

const formSchema = z.object({
  role: z.string().min(1, "Le rôle est requis."),
  email: z
    .string({ message: "L'email est requis." })
    .email("Veuillez entrer un email valide."),
});

type FormData = z.infer<typeof formSchema>;

interface InvitedEmail {
  email: string;
  invitationId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InviteForm({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
}: Props) {
  const [emailList, setEmailList] = useState<InvitedEmail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      email: "",
      role: "",
    },
  });

  const handleSendInvitation = useCallback(
    async (formData: FormData) => {
      const { email, role } = formData;

      // Vérifier si l'email existe déjà
      if (
        emailList.some(
          (item) => item.email.toLowerCase() === email.toLowerCase(),
        )
      ) {
        toast.error("Cet email a déjà été ajouté à la liste.");
        return;
      }

      setIsSubmitting(true);

      try {
        const { data, error } = await authClient.organization.inviteMember({
          email,
          role: role as any,
          resend: true,
        });

        if (error || !data) {
          const errorMessage =
            error?.message ||
            "Une erreur est survenue lors de l'envoi de l'invitation.";
          toast.error(errorMessage);
          return;
        }

        toast.success(`Invitation envoyée à ${email}`);
        setEmailList((prev) => [...prev, { email, invitationId: data.id }]);
        form.reset({ email: "", role });

        // Focus sur le champ email pour faciliter l'ajout d'autres invitations
        setTimeout(() => {
          const emailInput = document.querySelector<HTMLInputElement>(
            'input[name="email"]',
          );
          emailInput?.focus();
        }, 0);
      } catch (err) {
        toast.error("Une erreur inattendue est survenue.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [emailList, form],
  );

  const handleCancelInvite = useCallback((email: string) => {
    setEmailList((prev) => prev.filter((item) => item.email !== email));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter des utilisateurs</DialogTitle>
          <DialogDescription>
            Sélectionnez un rôle et entrez les adresses email des utilisateurs
            que vous souhaitez inviter.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSendInvitation)}
          className="space-y-6"
        >
          {/* Role Field */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="role">Rôle *</FieldLabel>
              <RoleMultiSelect
                value={form.watch("role").split(",").filter(Boolean)}
                onValueChange={(values) =>
                  form.setValue("role", values.join(","), {
                    shouldValidate: true,
                  })
                }
                disabled={isSubmitting}
              />
              <FieldError
                errors={
                  form.formState.errors.role ? [form.formState.errors.role] : []
                }
              />
            </Field>
          </FieldGroup>

          {/* Email Field */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Adresse email *</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="exemple@domaine.com"
                  type="email"
                  disabled={isSubmitting}
                  {...form.register("email")}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="shrink-0"
                >
                  {isSubmitting ? (
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
                  )}
                  <span className="ml-2">Envoyer</span>
                </Button>
              </div>
              <FieldError
                errors={
                  form.formState.errors.email
                    ? [form.formState.errors.email]
                    : []
                }
              />
            </Field>
          </FieldGroup>
        </form>
        {emailList.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <HugeiconsIcon
                  icon={UserCheckIcon}
                  className="h-4 w-4 text-primary"
                />
                Invitations envoyées
                <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {emailList.length}
                </span>
              </h3>
            </div>
            <div className="space-y-2">
              {emailList.map((item) => (
                <InvitedEmailItem
                  key={item.invitationId}
                  email={item.email}
                  invitationId={item.invitationId}
                  onSuccess={handleCancelInvite}
                />
              ))}
            </div>
          </div>
        )}
        {onCancel && onSuccess && emailList.length > 0 && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={onSuccess}>Terminer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InvitedEmailItemProps {
  email: string;
  invitationId: string;
  onSuccess?: (email: string) => void;
}

function InvitedEmailItem({
  email,
  invitationId,
  onSuccess,
}: InvitedEmailItemProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelInvite = async () => {
    if (isCancelling) return;

    setIsCancelling(true);

    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error) {
        const errorMessage =
          error?.message ||
          "Une erreur est survenue lors de l'annulation de l'invitation.";
        toast.error(errorMessage);
        setIsCancelling(false);
        return;
      }

      onSuccess?.(email);
      toast.success(`Invitation de ${email} annulée avec succès.`);
    } catch (err) {
      toast.error("Une erreur inattendue est survenue.");
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md ${isCancelling ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <HugeiconsIcon icon={MailIcon} className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{email}</span>
          <span className="text-xs text-muted-foreground">
            En attente d'acceptation
          </span>
        </div>
      </div>
      <ButtonTooltip
        variant="ghost"
        size="icon"
        tooltipContent="Annuler l'invitation"
        onClick={cancelInvite}
        disabled={isCancelling}
        className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        {isCancelling ? (
          <HugeiconsIcon
            icon={Loading01Icon}
            className="h-4 w-4 animate-spin"
          />
        ) : (
          <HugeiconsIcon icon={CancelCircleIcon} className="h-4 w-4" />
        )}
      </ButtonTooltip>
    </div>
  );
}
