import type { EmailProps } from "@nuntly/better-email";
import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

export default function TwoFactorOTPEmail({
  user,
  otp,
}: EmailProps<"two-factor-otp">) {
  return (
    <EmailLayout preview={`Votre code de vérification E-SFE Finance : ${otp}`}>
      <Text style={emailStyles.heading}>Code de vérification</Text>
      <Text style={emailStyles.body}>
        Bonjour {user.name ?? user.email},
        <br />
        <br />
        Utilisez le code ci-dessous pour finaliser votre connexion à E-SFE
        Finance. Ce code est valable 5 minutes.
      </Text>
      <Section style={emailStyles.otpBox}>
        <Text style={emailStyles.otpCode}>{otp}</Text>
      </Section>
      <Text style={emailStyles.note}>
        Ne partagez jamais ce code. Si vous n&apos;avez pas tenté de vous
        connecter, changez votre mot de passe immédiatement.
      </Text>
    </EmailLayout>
  );
}
