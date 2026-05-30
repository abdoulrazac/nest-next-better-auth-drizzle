import type { EmailProps } from "@nuntly/better-email";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

export default function VerificationEmail({
  user,
  url,
}: EmailProps<"verification-email">) {
  return (
    <EmailLayout preview="Vérifiez votre adresse e-mail pour activer votre compte.">
      <Text style={emailStyles.heading}>Vérifiez votre adresse e-mail</Text>
      <Text style={emailStyles.body}>
        Bonjour {user.name ?? user.email},
        <br />
        <br />
        Merci de vous être inscrit sur E-SFE Finance. Cliquez sur le bouton
        ci-dessous pour confirmer votre adresse e-mail et activer votre compte.
      </Text>
      <Button href={url} style={emailStyles.buttonPrimary}>
        Vérifier mon adresse e-mail
      </Button>
      <Text style={emailStyles.note}>
        Ce lien expire dans 24 heures. Si vous n&apos;avez pas créé de compte
        sur E-SFE Finance, ignorez cet e-mail.
      </Text>
    </EmailLayout>
  );
}
