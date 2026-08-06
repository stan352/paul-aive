import { AIVE_RESIDUAL_TIME_RATIO, type AgencyROIInput, type BrandROIInput } from "@/lib/roi-calculator";

export interface BreakEvenPoint {
  quantity: number;
  referenceCost: number;
  aiveCost: number;
}

export interface BreakEvenSeries {
  points: BreakEvenPoint[];
  breakEvenQuantity: number | null;
  quantityLabel: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// Multiplicateur appliqué au seuil de rentabilité pour fixer la borne haute
// de l'axe : au-delà de x2 (l'ancienne valeur), l'écart entre les deux
// courbes reste visuellement trop discret. x5 donne assez de recul après le
// croisement pour bien montrer l'écart qui se creuse à plus gros volume.
const RANGE_MULTIPLIER = 5;

function buildPoints(
  referenceCost: number,
  marginalAiveCost: number,
  fixedAiveCost: number,
  maxQuantity: number,
  steps = 60
): BreakEvenPoint[] {
  const points: BreakEvenPoint[] = [];
  const seenQuantities = new Set<number>();
  for (let i = 1; i <= steps; i++) {
    // Arrondi à l'entier : des chiffres de déclinaisons ronds, plus lisibles
    // en infobulle et sur l'axe, même si ça peut rapprocher deux points aux
    // tout premiers pas de la courbe (sans impact visuel notable).
    const quantity = Math.max(1, Math.round((maxQuantity / steps) * i));
    if (seenQuantities.has(quantity)) continue;
    seenQuantities.add(quantity);
    points.push({
      quantity,
      referenceCost: round(referenceCost),
      aiveCost: round(marginalAiveCost + fixedAiveCost / quantity),
    });
  }
  return points;
}

// Seuil de rentabilité mode Marque : coût agence (constant, par déclinaison
// en CREA / par mois en GEO) vs coût Aive moyen, qui décroît quand le coût
// annuel fixe se répartit sur davantage d'unités — les deux courbes se
// croisent exactement au "délai/nombre de déclinaisons pour rentabiliser"
// déjà utilisé par computeBrandROI.
export function buildBrandBreakEvenSeries(input: BrandROIInput): BreakEvenSeries {
  const breakEvenQuantity =
    input.agencyCost > 0 ? input.proposedAiveAnnualCost / input.agencyCost : null;
  const fallbackMax = input.agencyType === "CREA" ? input.annualVideoVolume : 12;
  const maxQuantity = Math.max(
    breakEvenQuantity ? breakEvenQuantity * RANGE_MULTIPLIER : fallbackMax,
    2
  );

  return {
    points: buildPoints(input.agencyCost, 0, input.proposedAiveAnnualCost, maxQuantity),
    breakEvenQuantity,
    quantityLabel: input.agencyType === "CREA" ? "déclinaisons" : "mois",
  };
}

// Seuil de rentabilité mode Agence : coût de production actuel par
// déclinaison (constant) vs coût de production avec Aive, qui décroît vers
// son coût marginal (temps résiduel × taux horaire) quand le coût annuel
// fixe Aive se répartit sur davantage de déclinaisons.
export function buildAgencyBreakEvenSeries(
  input: AgencyROIInput,
  quantityLabel = "déclinaisons"
): BreakEvenSeries {
  const marginalAiveCost =
    input.internalTimePerDeclinaison * AIVE_RESIDUAL_TIME_RATIO * input.teamHourlyRate;
  const referenceCost = input.internalTimePerDeclinaison * input.teamHourlyRate;
  const gap = referenceCost - marginalAiveCost;
  const breakEvenQuantity = gap > 0 ? input.proposedAiveAnnualCost / gap : null;
  const maxQuantity = Math.max(
    breakEvenQuantity ? breakEvenQuantity * RANGE_MULTIPLIER : input.annualVolume,
    2
  );

  return {
    points: buildPoints(referenceCost, marginalAiveCost, input.proposedAiveAnnualCost, maxQuantity),
    breakEvenQuantity,
    quantityLabel,
  };
}
