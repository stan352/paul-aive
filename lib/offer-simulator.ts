// Simulateur d'offre — estime la consommation annuelle de crédits d'un client à
// partir de paliers (volume, durée, usage, utilisateurs) et recommande l'offre
// la moins chère entre PRO et ENTERPRISE.
// Source des coûts : « Grille tarifaire AIVE - 09/10 » (Google Slides).

export type Palier<Id extends string = string> = {
  id: Id;
  label: string;
  // Valeur représentative utilisée dans le calcul (milieu de fourchette).
  value: number;
};

export const VIDEO_VOLUME_PALIERS = [
  { id: "lt100", label: "Moins de 100 vidéos / an", value: 50 },
  { id: "100-500", label: "100 à 500 vidéos / an", value: 300 },
  { id: "500-1000", label: "500 à 1 000 vidéos / an", value: 750 },
  { id: "1000-3000", label: "1 000 à 3 000 vidéos / an", value: 2000 },
  { id: "3000-10000", label: "3 000 à 10 000 vidéos / an", value: 6000 },
  { id: "gt10000", label: "Plus de 10 000 vidéos / an", value: 15000 },
] as const satisfies readonly Palier[];

// Durée moyenne d'une vidéo source, en minutes.
export const DURATION_PALIERS = [
  { id: "lt1", label: "Moins d'1 min (pub, social)", value: 0.5 },
  { id: "1-5", label: "1 à 5 min", value: 3 },
  { id: "5-20", label: "5 à 20 min", value: 12 },
  { id: "20-60", label: "20 min à 1 h (émission, webinar)", value: 40 },
  { id: "gt60", label: "Plus d'1 h (film, live, match)", value: 90 },
] as const satisfies readonly Palier[];

// Creative Data Extraction : crédits par minute de vidéo analysée.
export const ANALYSIS_MODELS = [
  { id: "S", label: "Modèle S — 4 crédits / min", value: 4 },
  { id: "M", label: "Modèle M — 6 crédits / min", value: 6 },
  { id: "L", label: "Modèle L — 8 crédits / min", value: 8 },
  { id: "XL", label: "Modèle XL — 10 crédits / min", value: 10 },
] as const satisfies readonly Palier[];

// Nombre de déclinaisons (outputs) générées par vidéo source.
export const DECLINAISON_PALIERS = [
  { id: "1-3", label: "1 à 3 déclinaisons / vidéo", value: 2 },
  { id: "4-10", label: "4 à 10 déclinaisons / vidéo", value: 7 },
  { id: "10-20", label: "10 à 20 déclinaisons / vidéo", value: 15 },
  { id: "gt20", label: "Plus de 20 déclinaisons / vidéo", value: 30 },
] as const satisfies readonly Palier[];

// Utilisateurs actifs côté client. `proExtraPacks` = nombre d'options
// « +10 users actifs » (3k€/an) nécessaires en PRO (10 actifs / jour inclus),
// calculé sur le haut de la fourchette. `null` = hors périmètre PRO.
// `enterpriseExtraPacks` = options « +300 users actifs » (10k€/an) en
// ENTERPRISE (300 actifs / mois inclus).
export const USER_PALIERS = [
  { id: "1-10", label: "1 à 10 utilisateurs", value: 10, proExtraPacks: 0, enterpriseExtraPacks: 0 },
  { id: "11-20", label: "11 à 20 utilisateurs", value: 20, proExtraPacks: 1, enterpriseExtraPacks: 0 },
  { id: "21-50", label: "21 à 50 utilisateurs", value: 50, proExtraPacks: 4, enterpriseExtraPacks: 0 },
  { id: "51-300", label: "51 à 300 utilisateurs", value: 300, proExtraPacks: null, enterpriseExtraPacks: 0 },
  { id: "gt300", label: "Plus de 300 utilisateurs", value: 600, proExtraPacks: null, enterpriseExtraPacks: 1 },
] as const;

export type UsageProfileId = "analysis" | "declinaisons" | "full";

// Crédits consommés par déclinaison selon le profil d'usage. Hypothèses :
// déclinaisons courtes (≤ 1 min 30) → AI AutoGen short ; 1 reframe ; sous-titres ;
// export HD. Le profil « Full » ajoute publication, sous-titres traduits
// (2 langues, ~1 min) et AI Dubbing (1 langue, ~1 min).
export const USAGE_PROFILES: Record<
  UsageProfileId,
  {
    label: string;
    description: string;
    perDeclinaison: { label: string; credits: number }[];
    // Creative Score : 1 crédit par nouveau template (≈ par vidéo source).
    perVideo: { label: string; credits: number }[];
  }
> = {
  analysis: {
    label: "Analyse seule",
    description: "Creative Data Extraction uniquement (taggage, insights, recherche).",
    perDeclinaison: [],
    perVideo: [],
  },
  declinaisons: {
    label: "Analyse + déclinaisons",
    description: "Analyse, puis génération de formats courts sous-titrés exportés en HD.",
    perDeclinaison: [
      { label: "AI AutoGen short", credits: 2 },
      { label: "Reframe", credits: 1 },
      { label: "Sous-titres", credits: 1 },
      { label: "Export HD", credits: 2 },
    ],
    perVideo: [{ label: "Creative Score", credits: 1 }],
  },
  full: {
    label: "Full (déclinaisons + localisation + publication)",
    description: "Déclinaisons, puis traduction, doublage IA et publication sur les réseaux.",
    perDeclinaison: [
      { label: "AI AutoGen short", credits: 2 },
      { label: "Reframe", credits: 1 },
      { label: "Sous-titres", credits: 1 },
      { label: "Export HD", credits: 2 },
      { label: "Publication", credits: 2 },
      { label: "Sous-titres traduits (2 langues)", credits: 2 },
      { label: "AI Dubbing (1 langue)", credits: 5 },
    ],
    perVideo: [{ label: "Creative Score", credits: 1 }],
  },
};

export const CREDIT_PACK_PRICE = 0.36;
const PRO_USERS_PACK_PRICE = 3000;
const ENTERPRISE_USERS_PACK_PRICE = 10000;

export const PLANS = {
  PRO: { name: "PRO", includedCredits: 30000, annualPrice: 10800 },
  ENTERPRISE: { name: "ENTERPRISE", includedCredits: 120000, annualPrice: 38400 },
} as const;

export type PlanId = keyof typeof PLANS;

export const OFFER_PLAN_FEATURES: Record<PlanId, string[]> = {
  PRO: ["2 To d'hébergement", "Aive Academy", "Support AI"],
  ENTERPRISE: [
    "10 To d'hébergement",
    "Aive Academy",
    "Support AI",
    "SSO personnalisé",
    "1 playbook",
    "Growth Partner dédié / SLA",
    "1 entraînement logo",
  ],
};

export type OfferSimulatorInput = {
  videoVolume: (typeof VIDEO_VOLUME_PALIERS)[number]["id"];
  duration: (typeof DURATION_PALIERS)[number]["id"];
  analysisModel: (typeof ANALYSIS_MODELS)[number]["id"];
  usageProfile: UsageProfileId;
  declinaisons: (typeof DECLINAISON_PALIERS)[number]["id"];
  users: (typeof USER_PALIERS)[number]["id"];
};

export type CreditLine = { label: string; credits: number };

export type PlanQuote = {
  plan: PlanId;
  // false si le palier d'utilisateurs dépasse ce que le plan peut couvrir.
  eligible: boolean;
  basePrice: number;
  extraCredits: number;
  extraCreditsCost: number;
  usersPacks: number;
  usersCost: number;
  totalCost: number;
  // Part des crédits inclus effectivement consommée (peut dépasser 100 %).
  includedUsageRatio: number;
  effectiveCreditPrice: number;
};

export type OfferSimulatorResult = {
  videos: number;
  totalMinutes: number;
  lines: CreditLine[];
  totalCredits: number;
  quotes: Record<PlanId, PlanQuote>;
  recommended: PlanId;
  costPerVideo: number;
};

function find<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((item) => item.id === id) ?? list[0];
}

function quotePlan(
  plan: PlanId,
  totalCredits: number,
  usersPacks: number | null
): PlanQuote {
  const { includedCredits, annualPrice } = PLANS[plan];
  const extraCredits = Math.max(0, totalCredits - includedCredits);
  const extraCreditsCost = extraCredits * CREDIT_PACK_PRICE;
  const packs = usersPacks ?? 0;
  const usersCost = packs * (plan === "PRO" ? PRO_USERS_PACK_PRICE : ENTERPRISE_USERS_PACK_PRICE);
  const totalCost = annualPrice + extraCreditsCost + usersCost;
  const billedCredits = Math.max(totalCredits, includedCredits);
  return {
    plan,
    eligible: usersPacks !== null,
    basePrice: annualPrice,
    extraCredits,
    extraCreditsCost,
    usersPacks: packs,
    usersCost,
    totalCost,
    includedUsageRatio: totalCredits / includedCredits,
    effectiveCreditPrice: (annualPrice + extraCreditsCost) / billedCredits,
  };
}

export function computeOfferSimulation(input: OfferSimulatorInput): OfferSimulatorResult {
  const videos = find(VIDEO_VOLUME_PALIERS, input.videoVolume).value;
  const minutesPerVideo = find(DURATION_PALIERS, input.duration).value;
  const creditsPerMinute = find(ANALYSIS_MODELS, input.analysisModel).value;
  const profile = USAGE_PROFILES[input.usageProfile];
  const declinaisonsPerVideo =
    input.usageProfile === "analysis" ? 0 : find(DECLINAISON_PALIERS, input.declinaisons).value;
  const users = find(USER_PALIERS, input.users);

  const totalMinutes = videos * minutesPerVideo;
  const lines: CreditLine[] = [
    { label: `Analyse (modèle ${input.analysisModel})`, credits: totalMinutes * creditsPerMinute },
    ...profile.perVideo.map((action) => ({
      label: action.label,
      credits: videos * action.credits,
    })),
    ...profile.perDeclinaison.map((action) => ({
      label: action.label,
      credits: videos * declinaisonsPerVideo * action.credits,
    })),
  ];
  const totalCredits = Math.ceil(lines.reduce((sum, line) => sum + line.credits, 0));

  const quotes: Record<PlanId, PlanQuote> = {
    PRO: quotePlan("PRO", totalCredits, users.proExtraPacks),
    ENTERPRISE: quotePlan("ENTERPRISE", totalCredits, users.enterpriseExtraPacks),
  };

  const recommended: PlanId =
    quotes.PRO.eligible && quotes.PRO.totalCost <= quotes.ENTERPRISE.totalCost
      ? "PRO"
      : "ENTERPRISE";

  return {
    videos,
    totalMinutes,
    lines,
    totalCredits,
    quotes,
    recommended,
    costPerVideo: quotes[recommended].totalCost / videos,
  };
}

// Volume de crédits au-delà duquel PRO + packs coûte plus cher qu'ENTERPRISE
// (hors options utilisateurs) : 30k + (38 400 − 10 800) / 0,36 ≈ 106 667.
export const PRO_TO_ENTERPRISE_CREDIT_THRESHOLD = Math.ceil(
  PLANS.PRO.includedCredits +
    (PLANS.ENTERPRISE.annualPrice - PLANS.PRO.annualPrice) / CREDIT_PACK_PRICE
);
