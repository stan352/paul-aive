"use client";

import type { ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { InfoIcon } from "lucide-react";

// Icône « i » qui affiche une explication au survol (ou au clic sur mobile).
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={100}
        aria-label={label}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <InfoIcon className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={6} className="isolate z-50">
          <Popover.Popup className="max-w-sm rounded-lg bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
