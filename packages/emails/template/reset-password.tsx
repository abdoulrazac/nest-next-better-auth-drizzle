import type { EmailProps } from "@nuntly/better-email";
import { Button, Text } from "@react-email/components";
import { getAppName } from "../runtime";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

export default function ResetPasswordEmail({
  user,
  url,
}: EmailProps<"reset-password">) {
  const appName = getAppName();
  return (
    <EmailLayout preview={`Réinitialisez votre mot de passe ${appName}.`}>
      <Text style={emailStyles.heading}>Réinitialisation de mot de passe</Text>
      <Text style={emailStyles.body}>
        Bonjour {user.name ?? user.email},
        <br />
        <br />
        Nous avons reçu une demande de réinitialisation du mot de passe associé
        à votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau
        mot de passe.
      </Text>
      <Button href={url} style={emailStyles.buttonPrimary}>
        Réinitialiser mon mot de passe
      </Button>
      <Text style={emailStyles.note}>
        Ce lien expire dans 1 heure. Si vous n&apos;avez pas demandé de
        réinitialisation, ignorez cet e-mail — votre mot de passe reste
        inchangé.
      </Text>
    </EmailLayout>
  );
}
