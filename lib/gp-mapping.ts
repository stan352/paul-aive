import type { ClientSegment } from "@/lib/prompt-templates";

export const GP_PROFILES = ["Stan", "Sofia", "Louis"] as const;

export type GpProfile = (typeof GP_PROFILES)[number];

export const GP_DEFAULT_SEGMENT: Record<GpProfile, ClientSegment> = {
  Stan: "Marques",
  Sofia: "Media & Networks",
  Louis: "Agences",
};
