import { Icon } from "@/components/ui/icon";
import { BriefcaseIcon } from "@/lib/icons";
import { createAuthPlugin } from "@better-auth-ui/core";
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions,
} from "@better-auth-ui/core/plugins";

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
              <Icon icon={BriefcaseIcon} className="text-muted-foreground" />
              {core.localization.organizations}
            </>
          ),
          component: OrganizationsSettings,
        },
      ],
    };
  },
);
