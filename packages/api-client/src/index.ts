// packages/api-client/src/index.ts
// Canonical entry for the generated OpenAPI TypeScript SDK.
//
// The generated `client` (from ./generated/client.gen) is the same instance
// the generated SDK class closes over, so we configure ITS baseUrl here —
// that way every typed method and every direct `client.get/post/...` call
// targets the right backend without per-call config.
import { getApiUrl } from "../runtime";
import { client } from "./generated/client.gen";
import { ApiClient } from "./generated/sdk.gen";

client.setConfig({ baseUrl: getApiUrl() });

// `apiClient` — the generated SDK class instance with namespaced methods:
//   apiClient.v1.usersFindAll({ query: { ... } })
//   apiClient.auth.createUser({ body: { ... } })
// `client` — the raw hey-api client (get/post/patch/delete/setConfig).
export const apiClient = new ApiClient({ client });

export { client, ApiClient };

// Generated request/response types.
export type * from "./generated/types.gen";
