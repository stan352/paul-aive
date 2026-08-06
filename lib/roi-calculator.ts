export type AgencyType = "CREA" | "GEO";
export type AgencyProductType = "Aive" | "Aive GEO";

export const AGENCY_COST_DEFAULTS: Record<AgencyType, number> = {
  CREA: 600,
  GEO: 2000,
};

// Coût annuel Aive par défaut selon l'offre vendue — même montant, que ce
// soit vu depuis le mode Marque (agencyType) ou Agence (productType).
export const AIVE_ANNUAL_COST_DEFAULTS = {
  videoGeneration: 38400, // Aive
  geo: 12000, // Aive GEO (audits + rédaction d'articles GEO)
} as const;

export interface BrandROIInput {
  agencyType: AgencyType;
  annualVideoVolume: number;
  // Volume annuel de livrables GEO (audits + articles) produits par l'agence
  // remplacée — n'intervient que si agencyType === "GEO", pour exprimer le
  // seuil de rentabilité en livrables plutôt qu'en mois.
  annualGeoVolume: number;
  agencyCost: number;
  proposedAiveAnnualCost: number;
}

export interface BrandROIResult {
  agencyAnnualCost: number;
  netAnnualSaving: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

// Ratio de temps résiduel avec Aive par déclinaison — fixé plutôt qu'exposé
// dans le formulaire pour garder l'Outil 3 à 4 champs essentiels côté GP.
export const AIVE_RESIDUAL_TIME_RATIO = 0.15;

export interface AgencyROIInput {
  internalTimePerDeclinaison: number;
  teamHourlyRate: number;
  annualVolume: number;
  proposedAiveAnnualCost: number;
}

export interface AgencyROIResult {
  currentCostPerDeclinaison: number;
  aiveCostPerDeclinaison: number;
  annualProductionSaving: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(denominator) || denominator === 0) return null;
  return numerator / denominator;
}

export function computeBrandROI({
  agencyType,
  annualVideoVolume,
  agencyCost,
  proposedAiveAnnualCost,
}: BrandROIInput): BrandROIResult {
  const agencyAnnualCost =
    agencyType === "CREA" ? annualVideoVolume * agencyCost : agencyCost * 12;

  const netAnnualSaving = agencyAnnualCost - proposedAiveAnnualCost;
  const roiPercent = safeDivide(netAnnualSaving, proposedAiveAnnualCost);
  const roiPercentValue = roiPercent === null ? null : roiPercent * 100;

  let paybackMonths: number | null;
  if (agencyType === "CREA") {
    const declinaisonsToBreakEven = safeDivide(proposedAiveAnnualCost, agencyCost);
    const monthlyVolume = annualVideoVolume / 12;
    paybackMonths =
      declinaisonsToBreakEven === null ? null : safeDivide(declinaisonsToBreakEven, monthlyVolume);
  } else {
    paybackMonths = safeDivide(proposedAiveAnnualCost, agencyCost);
  }

  return {
    agencyAnnualCost,
    netAnnualSaving,
    roiPercent: roiPercentValue,
    paybackMonths,
  };
}

export function computeAgencyROI({
  internalTimePerDeclinaison,
  teamHourlyRate,
  annualVolume,
  proposedAiveAnnualCost,
}: AgencyROIInput): AgencyROIResult {
  const currentCostPerDeclinaison = internalTimePerDeclinaison * teamHourlyRate;

  const residualTimePerDeclinaison = internalTimePerDeclinaison * AIVE_RESIDUAL_TIME_RATIO;

  const aiveCostPerAnnualShare = safeDivide(proposedAiveAnnualCost, annualVolume) ?? 0;
  const aiveCostPerDeclinaison =
    residualTimePerDeclinaison * teamHourlyRate + aiveCostPerAnnualShare;

  const annualProductionSaving =
    annualVolume * (currentCostPerDeclinaison - aiveCostPerDeclinaison);

  const roiPercent = safeDivide(annualProductionSaving, proposedAiveAnnualCost);
  const roiPercentValue = roiPercent === null ? null : roiPercent * 100;

  // Délai de rentabilité dérivé : le cahier des charges ne donne cette formule
  // que pour le mode Marque, mais demande une carte "Rentabilisé en" pour les
  // deux modes — on l'étend ici de façon analogue (coût Aive / économie
  // annuelle × 12), à ajuster si Stan veut une autre définition.
  const paybackMonths = safeDivide(proposedAiveAnnualCost, annualProductionSaving / 12);

  return {
    currentCostPerDeclinaison,
    aiveCostPerDeclinaison,
    annualProductionSaving,
    roiPercent: roiPercentValue,
    paybackMonths,
  };
}

// Mode Agence — offre Aive GEO : deux types de livrables bien distincts
// (audit, plus long et plus rare ; article, plus court et plus fréquent),
// chacun avec son propre temps de production et son propre volume annuel,
// pour refléter fidèlement le mix réel de l'agence plutôt qu'une moyenne.
export interface AgencyGeoROIInput {
  internalTimePerArticle: number;
  internalTimePerAudit: number;
  teamHourlyRate: number;
  annualArticleVolume: number;
  annualAuditVolume: number;
  proposedAiveAnnualCost: number;
}

export interface AgencyGeoROIResult {
  currentAnnualCost: number;
  aiveAnnualCost: number;
  annualProductionSaving: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

export function computeAgencyGeoROI({
  internalTimePerArticle,
  internalTimePerAudit,
  teamHourlyRate,
  annualArticleVolume,
  annualAuditVolume,
  proposedAiveAnnualCost,
}: AgencyGeoROIInput): AgencyGeoROIResult {
  const currentAnnualCost =
    annualArticleVolume * internalTimePerArticle * teamHourlyRate +
    annualAuditVolume * internalTimePerAudit * teamHourlyRate;

  const residualArticleTime = internalTimePerArticle * AIVE_RESIDUAL_TIME_RATIO;
  const residualAuditTime = internalTimePerAudit * AIVE_RESIDUAL_TIME_RATIO;

  const aiveAnnualCost =
    annualArticleVolume * residualArticleTime * teamHourlyRate +
    annualAuditVolume * residualAuditTime * teamHourlyRate +
    proposedAiveAnnualCost;

  const annualProductionSaving = currentAnnualCost - aiveAnnualCost;

  const roiPercent = safeDivide(annualProductionSaving, proposedAiveAnnualCost);
  const roiPercentValue = roiPercent === null ? null : roiPercent * 100;

  const paybackMonths = safeDivide(proposedAiveAnnualCost, annualProductionSaving / 12);

  return {
    currentAnnualCost,
    aiveAnnualCost,
    annualProductionSaving,
    roiPercent: roiPercentValue,
    paybackMonths,
  };
}
