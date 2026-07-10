import { z } from "zod";

export const sceneIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase letters, numbers, and single hyphens");

const layerConfigValueSchema = z.union([z.string(), z.number().finite(), z.boolean()]);

export const sceneSchema = z.object({
  id: sceneIdSchema,
  name: z.string().trim().min(1),
  sunAngle: z.number().finite(),
  layers: z.array(
    z.object({
      instanceId: z.string().min(1),
      type: z.enum(["sunGradient", "text", "shadow", "sunWidget"]),
      enabled: z.boolean(),
      config: z.record(z.string(), layerConfigValueSchema)
    })
  )
});

export function parseScene(input: unknown, owner = "scene") {
  const parsed = sceneSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid ${owner}: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
