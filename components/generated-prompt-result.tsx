"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function GeneratedPromptResult({
  prompt,
  initiallyCopied = false,
}: {
  prompt: string;
  initiallyCopied?: boolean;
}) {
  const [copied, setCopied] = useState(initiallyCopied);
  const [expanded, setExpanded] = useState(false);

  // La copie automatique (déclenchée avant même le premier rendu de ce
  // composant, voir lib/claude-design.ts) est confirmée de façon asynchrone —
  // initiallyCopied peut donc passer de false à true après le montage.
  useEffect(() => {
    if (initiallyCopied) setCopied(true);
  }, [initiallyCopied]);

  async function handleCopy() {
    // Ce clic est un vrai geste utilisateur dédié à la copie — contrairement
    // à une copie automatique après un fetch, il fonctionne de façon fiable
    // même quand un autre onglet (Claude Design) a pris le focus entre-temps.
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
      setExpanded(true);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
      <p>
        {copied
          ? "Prompt copié dans le presse-papier. Bascule sur l'onglet Claude Design et colle-le (Cmd+V)."
          : "Prêt. Clique pour copier le prompt, puis colle-le (Cmd+V) dans l'onglet Claude Design déjà ouvert."}
      </p>
      <Button type="button" size="sm" className="self-start" onClick={handleCopy}>
        {copied ? "Copié ✓ — recopier" : "Copier le prompt"}
      </Button>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="self-start text-xs text-muted-foreground underline"
      >
        {expanded ? "Masquer le prompt" : "Voir le prompt"}
      </button>
      {expanded && <Textarea readOnly value={prompt} rows={8} className="text-xs" />}
    </div>
  );
}
