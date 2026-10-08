// Simulateur d'offre Aive GEO — estime la consommation MENSUELLE de crédits
// (les crédits GEO ne se reportent pas d'un mois sur l'autre) et recommande
// Self-serve ou Accompagnement selon la maturité du client, les deux offres
// incluant le même volume de crédits.
// Source des coûts : slide « The Aive GEO credit » (1 crédit = 0,03 €).

import type { Palier } from "@/lib/offer-simulator";

export const GEO_CREDIT_PRICE = 0.03;
export const GEO_MONTHLY_CREDITS = 10000;

export const GEO_PLANS = {
  SELF_SERVE: { name: "Self-serve", annualPrice: 12000 },
  ACCOMPAGNEMENT: { name: "Avec accompagnement", annualPrice: 24000 },
} as const;

export type GeoPlanId = keyof typeof GEO_PLANS;

// Monitoring : 1 crédit par prompt exécuté sur un moteur IA (cf. l'audit
// complet = 5 moteurs × 10 prompts = 50 crédits).
export const GEO_PROMPT_PALIERS = [
  { id: "0", label: "Pas de monitoring", value: 0 },
  { id: "1-50", label: "1 à 50 prompts suivis", value: 25 },
  { id: "50-150", label: "50 à 150 prompts suivis", value: 100 },
  { id: "150-300", label: "150 à 300 prompts suivis", value: 225 },
  { id: "gt300", label: "Plus de 300 prompts suivis", value: 450 },
] as const satisfies readonly Palier[];

export const GEO_ENGINE_PALIERS = [
  { id: "1-2", label: "1 à 2 moteurs IA", value: 2 },
  { id: "3-4", label: "3 à 4 moteurs IA", value: 4 },
  { id: "5", label: "5 moteurs IA (ChatGPT, Gemini, Perplexity…)", value: 5 },
] as const satisfies readonly Palier[];

// Nombre d'exécutions de chaque prompt par mois.
export const GEO_FREQUENCY_PALIERS = [
  { id: "monthly", label: "Mensuelle", value: 1 },
  { id: "weekly", label: "Hebdomadaire", value: 4.33 },
  { id: "daily", label: "Quotidienne", value: 30 },
] as const satisfies readonly Palier[];

export const GEO_AUDIT_PALIERS = [
  { id: "0", label: "Aucun", value: 0 },
  { id: "1-2", label: "1 à 2 / mois", value: 1.5 },
  { id: "3-5", label: "3 à 5 / mois", value: 4 },
  { id: "6-10", label: "6 à 10 / mois", value: 8 },
  { id: "gt10", label: "Plus de 10 / mois", value: 15 },
] as const satisfies readonly Palier[];

export const GEO_ARTICLE_PALIERS = [
  { id: "0", label: "Aucun", value: 0 },
  { id: "1-5", label: "1 à 5 / mois", value: 3 },
  { id: "6-20", label: "6 à 20 / mois", value: 13 },
  { id: "21-50", label: "21 à 50 / mois", value: 35 },
  { id: "gt50", label: "Plus de 50 / mois", value: 75 },
] as const satisfies readonly Palier[];

export const GEO_DUBBING_PALIERS = [
  { id: "0", label: "Aucun", value: 0 },
  { id: "1-10", label: "1 à 10 / mois", value: 5 },
  { id: "11-50", label: "11 à 50 / mois", value: 30 },
  { id: "gt50", label: "Plus de 50 / mois", value: 75 },
] as const satisfies readonly Palier[];

// Analyses stratégiques, concepts créatifs, initiatives GEO (agent) : 2 crédits.
export const GEO_STRATEGY_PALIERS = [
  { id: "0", label: "Aucune", value: 0 },
  { id: "1-10", label: "1 à 10 / mois", value: 5 },
  { id: "11-30", label: "11 à 30 / mois", value: 20 },
  { id: "31-100", label: "31 à 100 / mois", value: 65 },
  { id: "gt100", label: "Plus de 100 / mois", value: 150 },
] as const satisfies readonly Palier[];

// Messages Copilot et GEO scorings : 1 crédit.
export const GEO_COPILOT_PALIERS = [
  { id: "low", label: "Usage léger (< 100 / mois)", value: 50 },
  { id: "medium", label: "Usage régulier (100 à 500 / mois)", value: 300 },
  { id: "high", label: "Usage intensif (500 à 1 500 / mois)", value: 1000 },
  { id: "vhigh", label: "Usage très intensif (> 1 500 / mois)", value: 2000 },
] as const satisfies readonly Palier[];

// Questions de maturité : `score` 0 = autonome, 2 = besoin d'accompagnement.
export const GEO_TEAM_OPTIONS = [
  { id: "dedicated", label: "Oui, une équipe dédiée", score: 0 },
  { id: "partial", label: "Partiellement (1 personne, temps partiel)", score: 1 },
  { id: "none", label: "Non", score: 2 },
] as const;

export const GEO_EXPERIENCE_OPTIONS = [
  { id: "advanced", label: "Déjà pratiqué (outils, process en place)", score: 0 },
  { id: "basic", label: "Quelques notions", score: 1 },
  { id: "none", label: "Débutant", score: 2 },
] as const;

export const GEO_MARKET_OPTIONS = [
  { id: "1", label: "1 marché / 1 langue", score: 0 },
  { id: "2-3", label: "2 à 3 marchés ou langues", score: 1 },
  { id: "gt3", label: "Plus de 3 marchés ou langues", score: 2 },
] as const;

// Score de maturité à partir duquel on pousse l'accompagnement.
export const GEO_ACCOMPAGNEMENT_SCORE_THRESHOLD = 3;

export type GeoSimulatorInput = {
  prompts: (typeof GEO_PROMPT_PALIERS)[number]["id"];
  engines: (typeof GEO_ENGINE_PALIERS)[number]["id"];
  frequency: (typeof GEO_FREQUENCY_PALIERS)[number]["id"];
  audits: (typeof GEO_AUDIT_PALIERS)[number]["id"];
  videoArticles: (typeof GEO_ARTICLE_PALIERS)[number]["id"];
  basicArticles: (typeof GEO_ARTICLE_PALIERS)[number]["id"];
  dubbings: (typeof GEO_DUBBING_PALIERS)[number]["id"];
  strategy: (typeof GEO_STRATEGY_PALIERS)[number]["id"];
  copilot: (typeof GEO_COPILOT_PALIERS)[number]["id"];
  team: (typeof GEO_TEAM_OPTIONS)[number]["id"];
  experience: (typeof GEO_EXPERIENCE_OPTIONS)[number]["id"];
  markets: (typeof GEO_MARKET_OPTIONS)[number]["id"];
};

export type GeoCreditLine = { label: string; credits: number };

export type GeoPlanQuote = {
  plan: GeoPlanId;
  basePrice: number;
  extraCredits: number;
  extraCreditsCost: number;
  totalCost: number;
};

export type GeoSimulatorResult = {
  lines: GeoCreditLine[];
  monthlyCredits: number;
  annualCredits: number;
  // Part des 10 000 crédits mensuels consommée (peut dépasser 100 %).
  monthlyUsageRatio: number;
  quotes: Record<GeoPlanId, GeoPlanQuote>;
  maturityScore: number;
  recommended: GeoPlanId;
  reasons: string[];
};

function find<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((item) => item.id === id) ?? list[0];
}

function quoteGeoPlan(plan: GeoPlanId, monthlyCredits: number): GeoPlanQuote {
  const { annualPrice } = GEO_PLANS[plan];
  // Les crédits ne se reportent pas : le dépassement se calcule chaque mois.
  const extraCredits = Math.max(0, monthlyCredits - GEO_MONTHLY_CREDITS) * 12;
  const extraCreditsCost = extraCredits * GEO_CREDIT_PRICE;
  return {
    plan,
    basePrice: annualPrice,
    extraCredits,
    extraCreditsCost,
    totalCost: annualPrice + extraCreditsCost,
  };
}

export function computeGeoSimulation(input: GeoSimulatorInput): GeoSimulatorResult {
  const prompts = find(GEO_PROMPT_PALIERS, input.prompts).value;
  const engines = find(GEO_ENGINE_PALIERS, input.engines).value;
  const runs = find(GEO_FREQUENCY_PALIERS, input.frequency).value;

  const lines: GeoCreditLine[] = [
    { label: "Monitoring (prompts × moteurs × fréquence)", credits: prompts * engines * runs },
    { label: "Audits GEO complets (50 cr.)", credits: find(GEO_AUDIT_PALIERS, input.audits).value * 50 },
    {
      label: "Articles vidéo complets (25 cr.)",
      credits: find(GEO_ARTICLE_PALIERS, input.videoArticles).value * 25,
    },
    {
      label: "Articles basiques (5 cr.)",
      credits: find(GEO_ARTICLE_PALIERS, input.basicArticles).value * 5,
    },
    {
      label: "Doublages multilingues (8 cr.)",
      credits: find(GEO_DUBBING_PALIERS, input.dubbings).value * 8,
    },
    {
      label: "Analyses stratégiques, concepts, initiatives (2 cr.)",
      credits: find(GEO_STRATEGY_PALIERS, input.strategy).value * 2,
    },
    {
      label: "Messages Copilot et GEO scorings (1 cr.)",
      credits: find(GEO_COPILOT_PALIERS, input.copilot).value,
    },
  ].filter((line) => line.credits > 0);

  const monthlyCredits = Math.ceil(lines.reduce((sum, line) => sum + line.credits, 0));

  const team = find(GEO_TEAM_OPTIONS, input.team);
  const experience = find(GEO_EXPERIENCE_OPTIONS, input.experience);
  const markets = find(GEO_MARKET_OPTIONS, input.markets);
  const maturityScore = team.score + experience.score + markets.score;

  const reasons: string[] = [];
  if (team.score === 2) reasons.push("pas d'équipe SEO / contenu en interne");
  else if (team.score === 1) reasons.push("équipe SEO / contenu partielle");
  if (experience.score === 2) reasons.push("débutant en GEO");
  else if (experience.score === 1) reasons.push("quelques notions de GEO seulement");
  if (markets.score === 2) reasons.push("plus de 3 marchés ou langues à couvrir");
  else if (markets.score === 1) reasons.push("2 à 3 marchés ou langues");

  // Sans équipe interne, le client ne pourra pas exploiter seul ses crédits.
  const recommended: GeoPlanId =
    team.score === 2 || maturityScore >= GEO_ACCOMPAGNEMENT_SCORE_THRESHOLD
      ? "ACCOMPAGNEMENT"
      : "SELF_SERVE";

  return {
    lines,
    monthlyCredits,
    annualCredits: monthlyCredits * 12,
    monthlyUsageRatio: monthlyCredits / GEO_MONTHLY_CREDITS,
    quotes: {
      SELF_SERVE: quoteGeoPlan("SELF_SERVE", monthlyCredits),
      ACCOMPAGNEMENT: quoteGeoPlan("ACCOMPAGNEMENT", monthlyCredits),
    },
    maturityScore,
    recommended,
    reasons,
  };
}
