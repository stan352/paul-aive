import {
  AIVE_RESIDUAL_TIME_RATIO,
  type AgencyGeoROIInput,
  type AgencyROIInput,
  type BrandROIInput,
} from "@/lib/roi-calculator";

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

// Seuil de rentabilité mode Marque, agence créative (CREA) : coût agence
// (constant par déclinaison) vs coût Aive moyen, qui décroît quand le coût
// annuel fixe se répartit sur davantage d'unités — les deux courbes se
// croisent exactement au "nombre de déclinaisons pour rentabiliser" déjà
// utilisé par computeBrandROI.
//
// Agence GEO : le coût agence est un forfait mensuel (pas de volume dans
// computeBrandROI), converti ici en coût par livrable GEO à partir du volume
// annuel de livrables (audits + articles) produits par l'agence, pour
// exprimer le seuil de rentabilité en livrables plutôt qu'en mois.
export function buildBrandBreakEvenSeries(input: BrandROIInput): BreakEvenSeries {
  if (input.agencyType === "CREA") {
    const breakEvenQuantity =
      input.agencyCost > 0 ? input.proposedAiveAnnualCost / input.agencyCost : null;
    const maxQuantity = Math.max(
      breakEvenQuantity ? breakEvenQuantity * RANGE_MULTIPLIER : input.annualVideoVolume,
      2
    );

    return {
      points: buildPoints(input.agencyCost, 0, input.proposedAiveAnnualCost, maxQuantity),
      breakEvenQuantity,
      quantityLabel: "déclinaisons",
    };
  }

  const agencyAnnualCost = input.agencyCost * 12;
  const costPerLivrable =
    input.annualGeoVolume > 0 ? agencyAnnualCost / input.annualGeoVolume : 0;
  const breakEvenQuantity =
    costPerLivrable > 0 ? input.proposedAiveAnnualCost / costPerLivrable : null;
  const maxQuantity = Math.max(
    breakEvenQuantity ? breakEvenQuantity * RANGE_MULTIPLIER : input.annualGeoVolume,
    2
  );

  return {
    points: buildPoints(costPerLivrable, 0, input.proposedAiveAnnualCost, maxQuantity),
    breakEvenQuantity,
    quantityLabel: "livrables GEO",
  };
}

// Seuil de rentabilité mode Agence, offre Aive (vidéo) : coût de production
// actuel par déclinaison (constant) vs coût de production avec Aive, qui
// décroît vers son coût marginal (temps résiduel × taux horaire) quand le
// coût annuel fixe Aive se répartit sur davantage de déclinaisons.
export function buildAgencyBreakEvenSeries(input: AgencyROIInput): BreakEvenSeries {
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
    quantityLabel: "déclinaisons",
  };
}

// Seuil de rentabilité mode Agence, offre Aive GEO : audits et articles ont
// des temps de production et des volumes propres. On pondère chacun par son
// volume réel pour obtenir un coût moyen par livrable qui reflète le mix
// actuel de l'agence, plutôt qu'une moyenne arbitraire — la courbe reste
// exprimée en "livrables GEO" mais le calcul sous-jacent tient compte des
// deux types de livrable séparément (cf. computeAgencyGeoROI).
export function buildAgencyGeoBreakEvenSeries(input: AgencyGeoROIInput): BreakEvenSeries {
  const totalVolume = input.annualArticleVolume + input.annualAuditVolume;

  const currentAnnualCost =
    input.annualArticleVolume * input.internalTimePerArticle * input.teamHourlyRate +
    input.annualAuditVolume * input.internalTimePerAudit * input.teamHourlyRate;
  const residualAnnualCost =
    input.annualArticleVolume *
      input.internalTimePerArticle *
      AIVE_RESIDUAL_TIME_RATIO *
      input.teamHourlyRate +
    input.annualAuditVolume * input.internalTimePerAudit * AIVE_RESIDUAL_TIME_RATIO * input.teamHourlyRate;

  const referenceCost = totalVolume > 0 ? currentAnnualCost / totalVolume : 0;
  const marginalAiveCost = totalVolume > 0 ? residualAnnualCost / totalVolume : 0;
  const gap = referenceCost - marginalAiveCost;
  const breakEvenQuantity = gap > 0 ? input.proposedAiveAnnualCost / gap : null;
  const maxQuantity = Math.max(
    breakEvenQuantity ? breakEvenQuantity * RANGE_MULTIPLIER : totalVolume,
    2
  );

  return {
    points: buildPoints(referenceCost, marginalAiveCost, input.proposedAiveAnnualCost, maxQuantity),
    breakEvenQuantity,
    quantityLabel: "livrables GEO",
  };
}
