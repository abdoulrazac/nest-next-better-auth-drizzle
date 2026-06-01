import { z } from "zod";

const healthIndicatorSchema = z
  .object({
    status: z.enum(["up", "down"]),
  })
  .passthrough();

export const healthCheckResponseSchema = z.object({
  status: z.enum(["ok", "error", "shutting_down"]),
  info: z.record(healthIndicatorSchema).optional(),
  error: z.record(healthIndicatorSchema).optional(),
  details: z.record(healthIndicatorSchema),
});

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
