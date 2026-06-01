import { defineConfig } from "@hey-api/openapi-ts";
import { getApiUrl } from "./runtime";

const apiUrl = getApiUrl();

export default defineConfig({
  input: `${apiUrl}/api/docs-json`,
  output: {
    path: "./src/generated",
    postProcess: ["prettier"],
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
});
