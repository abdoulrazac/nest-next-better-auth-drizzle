import { defineConfig } from "@hey-api/openapi-ts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getApiUrl } from "./runtime";

const STATIC_SPEC = resolve("./openapi.json");
const apiUrl = getApiUrl();

// Prefer a committed static snapshot (CI-friendly — no live backend needed at
// generate time, matching the turbo `inputs: ["openapi.json", ...]` contract).
// Fall back to fetching from the running backend's docs-json endpoint so
// `pnpm generate` also works during local dev before a snapshot is taken.
const input = existsSync(STATIC_SPEC) ? STATIC_SPEC : `${apiUrl}/api/docs-json`;

export default defineConfig({
  input,
  output: {
    path: "./src/generated",
    postProcess: ["prettier"],
  },
  plugins: [
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      operations: {
        // Group all operations under one class called `apiClient`
        containerName: "apiClient",
        strategy: "single",
        // Nest operations into `v1.*` and `auth.*` namespaces:
        //   UsersController_findAll_v1 (id: usersControllerFindAllV1) → v1.usersFindAll
        //   HealthController_check     (id: healthControllerCheck)    → v1.healthCheck
        //   createUser                 (id: createUser)               → auth.createUser
        //   getApiAuthCallbackById     (id: getApiAuthCallbackById)   → auth.getCallbackById
        nesting(operation) {
          // operation.operationId is the original OpenAPI operationId
          // (e.g. "UsersController_findAll_v1"). operation.id is hey-api's
          // internal ID derived from path+method (e.g. "getApiV1AccountsUsers").
          const opId = operation.operationId ?? operation.id ?? "";
          const path = operation.path ?? "";

          // Better Auth endpoints → auth.*
          if (path.startsWith("/api/auth/")) {
            const name = opId.replace(/^(\w+?)ApiAuth(.+)$/, "$1$2") || opId;
            return ["auth", name];
          }

          // Controller endpoints: operationId format is
          // "UsersController_findAll_v1" or "HealthController_check"
          const ctrlMatch = opId.match(/^(.+?)Controller_(.+?)(?:_(v\d+))?$/);
          if (ctrlMatch) {
            const [, controller, method, version] = ctrlMatch;
            const v = version ?? "v1";
            const ctrl =
              controller.charAt(0).toLowerCase() + controller.slice(1);
            const meth = method.charAt(0).toUpperCase() + method.slice(1);
            return [v, `${ctrl}${meth}`];
          }

          // Any non-controller endpoint → v1.{opId}
          return ["v1", opId];
        },
      },
    },
    "@hey-api/client-fetch",
  ],
});
