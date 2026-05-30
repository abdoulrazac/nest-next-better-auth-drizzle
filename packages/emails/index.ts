import {
  betterEmail,
  DefaultTemplateRenderer,
  type EmailProps,
  ReactEmailRenderer,
  SMTPProvider,
} from "@nuntly/better-email";
import { render } from "@react-email/render";
import { createElement } from "react";

import ChangeEmailVerificationEmail from "./template/change-email-verification";
import {
  createTransporter,
  getEmailRuntimeConfig,
  type EmailRuntimeConfig,
} from "./config";
import DeleteAccountVerificationEmail from "./template/delete-account-verification";
import OrganizationInvitationEmail from "./template/organization-invitation";
import ResetPasswordEmail from "./template/reset-password";
import TwoFactorOTPEmail from "./template/two-factor-otp";
import VerificationEmail from "./template/verification-email";

function getOrganizationInvitationAppUrl(config: EmailRuntimeConfig): string {
  if (!config.appUrl) {
    throw new Error(
      "APP_URL, NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL must be set to render organization invitation emails",
    );
  }

  return config.appUrl;
}

export function createEmailService(
  config: EmailRuntimeConfig = getEmailRuntimeConfig(),
) {
  const renderer = new ReactEmailRenderer({
    render,
    createElement,
    templates: {
      "verification-email": VerificationEmail,
      "reset-password": ResetPasswordEmail,
      "two-factor-otp": TwoFactorOTPEmail,
      "organization-invitation": (
        props: EmailProps<"organization-invitation">,
      ) =>
        createElement(OrganizationInvitationEmail, {
          ...props,
          appUrl: getOrganizationInvitationAppUrl(config),
        }),
      "change-email-verification": ChangeEmailVerificationEmail,
      "delete-account-verification": DeleteAccountVerificationEmail,
    },
    subjects: {
      "verification-email": "Vérifiez votre adresse e-mail – E-SFE Finance",
      "reset-password":
        "Réinitialisation de votre mot de passe – E-SFE Finance",
      "two-factor-otp": "Votre code de vérification – E-SFE Finance",
      "organization-invitation":
        "Invitation à rejoindre une organisation – E-SFE Finance",
      "change-email-verification":
        "Confirmez votre nouvelle adresse e-mail – E-SFE Finance",
      "delete-account-verification":
        "Confirmation de suppression de compte – E-SFE Finance",
    },
    fallback: new DefaultTemplateRenderer(),
  });

  const provider = new SMTPProvider({
    transporter: createTransporter(config),
    from: config.smtp.from,
  });

  return betterEmail({
    provider,
    templateRenderer: renderer,
    onAfterSend: async (context, message) => {
      console.log(`[email] ${context.type} → ${message.to}`);
    },
    onSendError: async (context, message, error) => {
      console.error(`[email] failed ${context.type} → ${message.to}`, error);
    },
  });
}

export {
  createTransporter,
  getEmailRuntimeConfig,
  type EmailRuntimeConfig,
} from "./config";

export { EmailLayout } from "./template/_layout";
export { emailStyles } from "./template/email-theme";
export { default as ChangeEmailVerificationEmail } from "./template/change-email-verification";
export { default as DeleteAccountVerificationEmail } from "./template/delete-account-verification";
export { default as OrganizationInvitationEmail } from "./template/organization-invitation";

export { default as ResetPasswordEmail } from "./template/reset-password";
export { default as TwoFactorOTPEmail } from "./template/two-factor-otp";
export { default as VerificationEmail } from "./template/verification-email";
