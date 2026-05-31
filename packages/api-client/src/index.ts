// packages/api-client/src/index.ts
export * from "./generated/index";
import { createClient, createConfig } from "@hey-api/client-fetch";

export const apiClient = createClient(
  createConfig({
    baseUrl:
      typeof process !== "undefined"
        ? (process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3000")
        : "http://localhost:3000",
  }),
);
