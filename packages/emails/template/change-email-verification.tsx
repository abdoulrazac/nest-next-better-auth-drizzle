import type { EmailProps } from "@nuntly/better-email";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

export default function ChangeEmailVerificationEmail({
  user,
  newEmail,
  url,
}: EmailProps<"change-email-verification">) {
  return (
    <EmailLayout
      preview={`Confirmez votre nouvelle adresse e-mail : ${newEmail}`}
    >
      <Text style={emailStyles.heading}>
        Vérification de nouvelle adresse e-mail
      </Text>
      <Text style={emailStyles.body}>
        Bonjour {user.name ?? user.email},
        <br />
        <br />
        Nous avons reçu une demande de changement d&apos;adresse e-mail pour
        votre compte E-SFE Finance. Votre nouvelle adresse sera :{" "}
        <strong>{newEmail}</strong>.<br />
        <br />
        Cliquez sur le bouton ci-dessous pour confirmer ce changement.
      </Text>
      <Button href={url} style={emailStyles.buttonPrimary}>
        Confirmer ma nouvelle adresse
      </Button>
      <Text style={emailStyles.note}>
        Ce lien expire dans 24 heures. Si vous n&apos;avez pas demandé ce
        changement, ignorez cet e-mail et votre adresse actuelle reste
        inchangée.
      </Text>
    </EmailLayout>
  );
}
