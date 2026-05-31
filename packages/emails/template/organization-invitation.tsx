import type { EmailProps } from "@nuntly/better-email";
import { Button, Text } from "@react-email/components";
import { getAppName } from "../runtime";
import { EmailLayout } from "./_layout";
import { emailStyles } from "./email-theme";

interface OrganizationInvitationEmailProps extends EmailProps<"organization-invitation"> {
  appUrl: string;
}

export default function OrganizationInvitationEmail({
  role,
  organization,
  inviter,
  invitation,
  appUrl,
}: OrganizationInvitationEmailProps) {
  const acceptUrl = new URL("/auth/accept-invitation", appUrl);
  acceptUrl.searchParams.set("invitationId", invitation.id);
  const appName = getAppName();

  return (
    <EmailLayout
      preview={`${inviter.user.name ?? inviter.user.email} vous invite à rejoindre ${organization.name}.`}
    >
      <Text style={emailStyles.heading}>
        Invitation à rejoindre une organisation
      </Text>
      <Text style={emailStyles.body}>
        Bonjour,
        <br />
        <br />
        <strong>{inviter.user.name ?? inviter.user.email}</strong> vous invite à
        rejoindre l&apos;organisation <strong>{organization.name}</strong> sur{" "}
        {appName} en tant que <strong>{role}</strong>.
      </Text>

      <Text style={emailStyles.badge}>Organisation : {organization.name}</Text>
      <br />
      <Button href={acceptUrl.toString()} style={emailStyles.buttonPrimary}>
        Accepter l&apos;invitation
      </Button>
      <Text style={emailStyles.note}>
        Si vous n&apos;attendiez pas cette invitation ou ne souhaitez pas
        rejoindre cette organisation, ignorez cet e-mail.
      </Text>
    </EmailLayout>
  );
}
