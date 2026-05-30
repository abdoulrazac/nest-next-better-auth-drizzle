import type { EmailProps } from "@nuntly/better-email";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

export default function DeleteAccountVerificationEmail({
  user,
  url,
}: EmailProps<"delete-account-verification">) {
  return (
    <EmailLayout preview="Confirmez la suppression définitive de votre compte E-SFE Finance.">
      <Text style={emailStyles.headingDestructive}>Suppression de compte</Text>
      <Text style={emailStyles.body}>
        Bonjour {user.name ?? user.email},
        <br />
        <br />
        Nous avons reçu une demande de suppression de votre compte E-SFE
        Finance. Cette action est <strong>irréversible</strong> et entraînera la
        suppression de toutes vos données.
      </Text>
      <Text className="warning-box" style={emailStyles.warningText}>
        ⚠️ Toutes vos données, factures et documents associés seront
        définitivement supprimés.
      </Text>
      <Button href={url} style={emailStyles.buttonDestructive}>
        Confirmer la suppression
      </Button>
      <Text style={emailStyles.note}>
        Ce lien expire dans 1 heure. Si vous n&apos;avez pas demandé la
        suppression de votre compte, ignorez cet e-mail — votre compte reste
        actif.
      </Text>
    </EmailLayout>
  );
}
