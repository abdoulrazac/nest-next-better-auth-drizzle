import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { emailStyles } from "./email-theme";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  const appName = process.env.APP_NAME ?? "My APP";
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.header}>
            <Text style={emailStyles.brandText}>{appName}</Text>
          </Section>
          <Section style={emailStyles.content}>{children}</Section>
          <Hr style={emailStyles.hr} />
          <Section style={emailStyles.footer}>
            <Text style={emailStyles.footerText}>
              © {new Date().getFullYear()} {appName}. Tous droits réservés.
            </Text>
            <Text style={{ ...emailStyles.footerText, marginTop: "4px" }}>
              Cet e-mail vous a été envoyé automatiquement. Merci de ne pas y
              répondre.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
