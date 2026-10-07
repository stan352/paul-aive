import {
  ANALYSIS_MODELS,
  CREDIT_PACK_PRICE,
  DECLINAISON_PALIERS,
  DURATION_PALIERS,
  OFFER_PLAN_FEATURES,
  PLANS,
  USAGE_ACTIONS,
  hasDeclinaisonActions,
  USER_PALIERS,
  VIDEO_VOLUME_PALIERS,
  type OfferSimulatorInput,
  type OfferSimulatorResult,
  type PlanId,
  type PlanQuote,
} from "@/lib/offer-simulator";

export const TARGET_SOLUTIONS = ["Aive", "Aive GEO", "Aive + Aive GEO"] as const;

export const CLIENT_SEGMENTS = ["Agences", "Marques", "Media & Networks"] as const;

export type TargetSolution = (typeof TARGET_SOLUTIONS)[number];
export type ClientSegment = (typeof CLIENT_SEGMENTS)[number];

export interface OpportunityPromptInput {
  gpProfile: string;
  clientUrl: string;
  clientSegment: ClientSegment;
}

export interface DiscoveryPromptInput {
  personaRole: string;
  targetSolution: TargetSolution;
  clientSegment: ClientSegment;
  clientUrl?: string;
}

const AGENCES_CHIFFRES_CLAUSE =
  "  Segment Agences : les 5 chiffres doivent être exactement le temps de production interne\n" +
  "  par déclinaison (h), le taux horaire moyen de l'équipe créa/prod, le coût moyen de\n" +
  "  sous-traitance/freelance par déclinaison, le volume annuel de déclinaisons produites, et\n" +
  "  le prix moyen facturé au client final par déclinaison (ces réponses serviront au calcul\n" +
  "  ROI agence en RDV 3).\n";

export function buildDiscoveryPrompt({
  personaRole,
  targetSolution,
  clientSegment,
  clientUrl,
}: DiscoveryPromptInput): string {
  const trimmedUrl = clientUrl?.trim();
  return (
    `Tu es l'Expert Sales Enablement chez Aive.\n` +
    `Génère un plan d'attaque commercial complet et détaillé pour un RDV 1 de Découverte.\n` +
    `Ce plan doit pouvoir être utilisé tel quel par un Growth Partner pendant l'appel, sans\n` +
    `préparation supplémentaire — sois dense et concret, pas générique.\n` +
    `ENTRÉES : Persona=${personaRole}, Solution=${targetSolution}, Segment=${clientSegment}` +
    (trimmedUrl ? `, Site=${trimmedUrl}` : "") +
    `.\n` +
    `CONSIGNES :\n` +
    (trimmedUrl
      ? `- Recherche en ligne le site et l'actualité du prospect (${trimmedUrl}) pour personnaliser\n` +
        `  au maximum le contexte, les chiffres à collecter, les piliers et les objections à sa\n` +
        `  situation réelle — évite tout contenu générique.\n`
      : "") +
    `- Une partie Contexte résumant en quelques lignes le persona, la solution ciblée, le\n` +
    `  segment et, si fourni, le site du prospect.\n` +
    `- Identifie les 5 chiffres clés (indicateurs numériques concrets, adaptés au segment) que\n` +
    `  le GP doit absolument ramener de cet appel, avec pour chacun un exemple de question à\n` +
    `  poser pour l'obtenir.\n` +
    (clientSegment === "Agences" ? AGENCES_CHIFFRES_CLAUSE : "") +
    `- 4 à 5 piliers d'argumentation, chacun avec un message développé (2-3 phrases) et une\n` +
    `  preuve chiffrée concrète, adaptés au persona et au segment.\n` +
    `- 5 à 6 objections courantes pour ce segment, avec un recadrage argumenté (pas une réponse\n` +
    `  en une ligne).\n` +
    `Crée un deck de slides compact (une poignée de slides, pas trop denses) avec ces\n` +
    `informations, structuré en 4 parties claires : Contexte, Les cinq chiffres à ramener de\n` +
    `cet appel, Piliers d'argumentation, Traitement des objections — pas un one-pager texte.\n` +
    `\n` +
    `CONTRAINTES DE MISE EN PAGE :\n` +
    `- Slide 1 : titre "RDV DÉCOUVERTE", avec en dessous un court sous-titre (1 à 2 lignes)\n` +
    `  rappelant l'objectif de ce RDV de découverte et le contenu du deck (contexte, chiffres\n` +
    `  clés à obtenir, arguments, objections).\n` +
    `- La partie Contexte tient sur une seule slide.\n` +
    `- La slide "Les cinq chiffres à ramener de cet appel" tient sur une seule slide.`
  );
}

export function buildOpportunityPrompt({
  gpProfile,
  clientUrl,
  clientSegment,
}: OpportunityPromptInput): string {
  return (
    `Fais une recherche en ligne sur le prospect ${clientUrl} (segment ${clientSegment}) via\n` +
    `Google Actualités, LinkedIn, son site, sa presse, pour trouver 3 à 5 opportunités\n` +
    `commerciales exploitables par le Growth Partner ${gpProfile} : lancement produit,\n` +
    `campagne marketing, expansion, recrutement clé, changement organisationnel. Pour chacune,\n` +
    `explique en une phrase pourquoi elle est exploitable commercialement.\n` +
    `\n` +
    `Nous vendons uniquement deux offres, à recommander séparément ou ensemble selon le\n` +
    `prospect :\n` +
    `- Aive : génération vidéo IA pour produire des déclinaisons marketing/vidéo à grande échelle.\n` +
    `- Aive GEO : audit et optimisation de la visibilité de la marque dans les réponses des moteurs\n` +
    `  IA (AEO/GEO — Answer Engine / Generative Engine Optimization).\n` +
    `\n` +
    `Construis un plan pour le rendez-vous de pitch client, adapté au segment ${clientSegment}\n` +
    `(ton, exemples et arguments pertinents pour ce type d'interlocuteur), couvrant 3 scénarios\n` +
    `de vente : Aive seul, Aive GEO seul, et Aive + Aive GEO ensemble. Pour chaque scénario : la\n` +
    `justification du choix au vu des opportunités identifiées, un script d'amorce, les points\n` +
    `de discussion à dérouler, et des questions de qualification.\n` +
    `\n` +
    `Crée quelques slides avec ces informations — pas de texte structuré, un support visuel prêt\n` +
    `pour le rendez-vous.\n` +
    `\n` +
    `CONTRAINTE DE MISE EN PAGE : Slide 1, titre "RDV PITCH", avec en dessous un court\n` +
    `sous-titre (1 à 2 lignes) rappelant l'objectif de ce pitch et le contenu du deck\n` +
    `(opportunités identifiées, offre recommandée, plan d'action).`
  );
}

export interface OfferPromptInput {
  prospect?: string;
  input: OfferSimulatorInput;
  result: OfferSimulatorResult;
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const creditPrice = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
const integer = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });

function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? id;
}

function describeQuote(quote: PlanQuote): string {
  const plan = PLANS[quote.plan];
  if (!quote.eligible) {
    return `- ${plan.name} : non adapté (nombre d'utilisateurs au-delà du périmètre PRO).\n`;
  }
  return (
    `- ${plan.name} : ${euros.format(quote.totalCost)} / an au total — plan annuel ` +
    `${euros.format(quote.basePrice)} (${integer.format(plan.includedCredits)} crédits inclus)` +
    (quote.extraCredits > 0
      ? ` + packs de ${integer.format(quote.extraCredits)} crédits (${euros.format(quote.extraCreditsCost)})`
      : "") +
    (quote.usersPacks > 0
      ? ` + ${quote.usersPacks} option(s) utilisateurs (${euros.format(quote.usersCost)})`
      : "") +
    `. ${percent.format(quote.includedUsageRatio)} des crédits inclus consommés, prix effectif ` +
    `${creditPrice.format(quote.effectiveCreditPrice)} / crédit.\n`
  );
}

export function buildOfferPrompt({ prospect, input, result }: OfferPromptInput): string {
  const trimmedProspect = prospect?.trim();
  const recommended = PLANS[result.recommended];
  const other: PlanId = result.recommended === "PRO" ? "ENTERPRISE" : "PRO";
  const actions = USAGE_ACTIONS.filter((action) =>
    (input.usageActions as string[]).includes(action.id)
  );
  return (
    `Tu es l'Expert Sales Enablement chez Aive.\n` +
    `Crée un deck de proposition commerciale présentant l'offre Aive recommandée` +
    (trimmedProspect ? ` pour le prospect ${trimmedProspect}` : "") +
    `, à partir de la simulation ci-dessous réalisée par le Growth Partner.\n` +
    (trimmedProspect
      ? `Recherche rapidement en ligne qui est ${trimmedProspect} pour personnaliser le ton et\n` +
        `les exemples d'usage, sans modifier aucun chiffre.\n`
      : "") +
    `\n` +
    `BESOINS DU PROSPECT (fourchettes estimées) :\n` +
    `- Volume : ${labelOf(VIDEO_VOLUME_PALIERS, input.videoVolume)}\n` +
    `- Durée moyenne par vidéo : ${labelOf(DURATION_PALIERS, input.duration)}\n` +
    `- Usages : analyse des vidéos (Creative Data Extraction)` +
    (actions.length > 0 ? `, ${actions.map((action) => action.label).join(", ")}` : "") +
    `\n` +
    (hasDeclinaisonActions(input.usageActions)
      ? `- Déclinaisons : ${labelOf(DECLINAISON_PALIERS, input.declinaisons)}\n`
      : "") +
    `- ${labelOf(ANALYSIS_MODELS, input.analysisModel)}\n` +
    `- Utilisateurs : ${labelOf(USER_PALIERS, input.users)}\n` +
    `\n` +
    `CONSOMMATION ESTIMÉE : ${integer.format(result.totalCredits)} crédits / an ` +
    `(≈ ${integer.format(result.videos)} vidéos, ${integer.format(result.totalMinutes / 60)} h de contenu).\n` +
    result.lines
      .map(
        (line) =>
          `- ${line.label} : ${integer.format(line.credits)} crédits ` +
          `(${percent.format(line.credits / result.totalCredits)})\n`
      )
      .join("") +
    `\n` +
    `COMPARAISON DES OFFRES :\n` +
    describeQuote(result.quotes[result.recommended]) +
    describeQuote(result.quotes[other]) +
    `\n` +
    `OFFRE RECOMMANDÉE : ${recommended.name}, soit ${euros.format(result.quotes[result.recommended].totalCost)} / an ` +
    `(≈ ${euros.format(result.costPerVideo)} par vidéo).\n` +
    `Inclus en ${recommended.name} : ${OFFER_PLAN_FEATURES[result.recommended].join(", ")}.\n` +
    `Solutions incluses dans les deux offres : Web Platform, API Platform, Plugin Adobe, AEO / GEO.\n` +
    `Rappels : les crédits annuels non consommés se reportent d'une année sur l'autre ; une\n` +
    `action qui échoue n'est pas débitée ; les packs de crédits supplémentaires sont à\n` +
    `${creditPrice.format(CREDIT_PACK_PRICE)} / crédit.\n` +
    `\n` +
    `Crée un deck de slides compact (une poignée de slides, visuelles, peu denses), structuré en\n` +
    `4 parties : Vos besoins, Votre consommation estimée, L'offre recommandée, Comparaison des\n` +
    `offres — pas un one-pager texte.\n` +
    `\n` +
    `CONTRAINTES DE MISE EN PAGE :\n` +
    `- Slide 1 : titre "PROPOSITION D'OFFRE", avec en dessous un court sous-titre (1 à 2 lignes)\n` +
    `  rappelant l'objectif du deck (dimensionner l'offre Aive selon le volume vidéo du prospect).\n` +
    `- Chaque partie tient sur une seule slide.\n` +
    `- La slide "L'offre recommandée" met en avant ${recommended.name} et son prix annuel en très gros.\n` +
    `- Utilise exactement les chiffres fournis : ne recalcule rien et n'invente aucun prix.`
  );
}
