import { loader } from "fumadocs-core/source";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error generated file
import { docs } from "../../.source/server";

export const source = loader({
  baseUrl: "/docs",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  source: (docs as any).toFumadocsSource(),
});
