// Couleurs explicites (hex) plutôt que des variables CSS (`var(--primary)`) :
// une fois un graphique exporté en PNG, le SVG est isolé de la feuille de
// style de la page et les variables CSS ne se résolvent plus, ce qui rendait
// les courbes/barres invisibles ou noires sur les images téléchargées.
export const AIVE_CHART_COLOR = "#247AE4";
export const REFERENCE_CHART_COLOR = "#94a3b8";
export const BREAK_EVEN_MARKER_COLOR = "#CC44A5";
