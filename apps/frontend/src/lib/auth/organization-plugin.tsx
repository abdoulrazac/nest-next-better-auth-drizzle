import { createAuthPlugin } from "@better-auth-ui/core";
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions,
} from "@better-auth-ui/core/plugins";
import { HugeiconsIcon } from "@hugeicons/react";
import { BriefcaseIcon } from "@/lib/icons";

import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings";

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const core = coreOrganizationPlugin(options);

    return {
      ...core,
      localization: core.localization as OrganizationLocalization,
      settingsTabs: [
        {
          view: "organizations",
          label: (
            <>
              <HugeiconsIcon
                icon={BriefcaseIcon}
                className="text-muted-foreground"
              />
              {core.localization.organizations}
            </>
          ),
          component: OrganizationsSettings,
        },
      ],
    };
  },
);
