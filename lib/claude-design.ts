export const CLAUDE_DESIGN_URL = "https://claude.ai/design";

/**
 * Ouvre Claude Design et tente de copier le prompt dans le presse-papier.
 *
 * Les deux appels doivent rester synchrones et consécutifs, sans await entre
 * eux : window.open() serait bloqué par le navigateur une fois le "geste
 * utilisateur" du clic expiré, et clipboard.writeText() échouerait pour la
 * même raison si un fetch (ou tout autre await) s'intercale avant l'appel.
 * onCopyResult est notifié une fois la promesse résolue ; en cas d'échec, le
 * bouton "Copier le prompt" de GeneratedPromptResult reste le filet de
 * secours (nouveau geste utilisateur, donc fiable même si celui-ci échoue).
 */
export function openClaudeDesignWithPrompt(
  prompt: string,
  onCopyResult: (copied: boolean) => void
): Window | null {
  const designTab = window.open(CLAUDE_DESIGN_URL, "_blank");

  try {
    navigator.clipboard.writeText(prompt).then(
      () => onCopyResult(true),
      () => onCopyResult(false)
    );
  } catch {
    onCopyResult(false);
  }

  return designTab;
}
