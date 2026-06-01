// packages/api-client/src/index.ts
export * from "./generated/index";
import { createClient, createConfig } from "@hey-api/client-fetch";
import { getApiUrl } from "../runtime";

export const apiClient = createClient(
  createConfig({
    baseUrl: getApiUrl(),
  }),
);
