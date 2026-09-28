import type { ClientSegment } from "@/lib/prompt-templates";

export const GP_PROFILES = ["Stan", "Sofia", "Louis", "Karen"] as const;

export type GpProfile = (typeof GP_PROFILES)[number];

export const GP_DEFAULT_SEGMENT: Record<GpProfile, ClientSegment> = {
  Stan: "Marques",
  Sofia: "Media & Networks",
  Louis: "Agences",
  // Karen fait du new business tous segments confondus (pas un segment dédié
  // comme les 3 autres GP) — Marques choisi comme défaut par simplicité, le
  // select reste modifiable ensuite.
  Karen: "Marques",
};
