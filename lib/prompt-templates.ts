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
import {
  GEO_ARTICLE_PALIERS,
  GEO_AUDIT_PALIERS,
  GEO_COPILOT_PALIERS,
  GEO_CREDIT_PRICE,
  GEO_DUBBING_PALIERS,
  GEO_ENGINE_PALIERS,
  GEO_FREQUENCY_PALIERS,
  GEO_MONTHLY_CREDITS,
  GEO_PLANS,
  GEO_PROMPT_PALIERS,
  GEO_STRATEGY_PALIERS,
  type GeoPlanId,
  type GeoPlanQuote,
  type GeoSimulatorInput,
  type GeoSimulatorResult,
} from "@/lib/geo-offer-simulator";

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
      ? ` + packs de ${integer.format(quote.extraCredits)} crédits à ${creditPrice.format(CREDIT_PACK_PRICE)} / crédit (${euros.format(quote.extraCreditsCost)})`
      : "") +
    (quote.usersPacks > 0
      ? ` + ${quote.usersPacks} option(s) utilisateurs (${euros.format(quote.usersCost)})`
      : "") +
    `. ${percent.format(quote.includedUsageRatio)} des crédits inclus consommés. Prix du crédit ` +
    `inclus : ${creditPrice.format(quote.includedCreditPrice)} / crédit.\n`
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
    `- Utilise exactement les chiffres fournis : ne recalcule rien et n'invente aucun prix.\n` +
    `- Les seuls prix du crédit à afficher sont ceux de la grille : ${creditPrice.format(PLANS.PRO.annualPrice / PLANS.PRO.includedCredits)} (PRO),\n` +
    `  ${creditPrice.format(PLANS.ENTERPRISE.annualPrice / PLANS.ENTERPRISE.includedCredits)} (ENTERPRISE) et ${creditPrice.format(CREDIT_PACK_PRICE)} (packs). N'affiche jamais de prix moyen ou\n` +
    `  « effectif » par crédit.`
  );
}

export interface GeoOfferPromptInput {
  prospect?: string;
  input: GeoSimulatorInput;
  result: GeoSimulatorResult;
}

export function buildGeoOfferPrompt({ prospect, input, result }: GeoOfferPromptInput): string {
  const trimmedProspect = prospect?.trim();
  const recommended = GEO_PLANS[result.recommended];
  const other: GeoPlanId = result.recommended === "SELF_SERVE" ? "ACCOMPAGNEMENT" : "SELF_SERVE";
  const describeGeoQuote = (quote: GeoPlanQuote) =>
    `- Aive GEO ${GEO_PLANS[quote.plan].name} : ${euros.format(quote.totalCost)} / an` +
    (quote.extraCredits > 0
      ? ` (abonnement ${euros.format(quote.basePrice)} + ${integer.format(quote.extraCredits)} crédits ` +
        `supplémentaires sur l'année à ${creditPrice.format(GEO_CREDIT_PRICE)}, soit ${euros.format(quote.extraCreditsCost)})`
      : "") +
    `.\n`;
  return (
    `Tu es l'Expert Sales Enablement chez Aive.\n` +
    `Crée un deck de proposition commerciale présentant l'offre Aive GEO recommandée` +
    (trimmedProspect ? ` pour le prospect ${trimmedProspect}` : "") +
    `, à partir de la simulation ci-dessous réalisée par le Growth Partner. Aive GEO mesure et\n` +
    `améliore la visibilité de la marque dans les réponses des moteurs IA (AEO / GEO).\n` +
    (trimmedProspect
      ? `Recherche rapidement en ligne qui est ${trimmedProspect} pour personnaliser le ton et\n` +
        `les exemples d'usage, sans modifier aucun chiffre.\n`
      : "") +
    `\n` +
    `BESOINS DU PROSPECT (fourchettes estimées, par mois) :\n` +
    `- Monitoring : ${labelOf(GEO_PROMPT_PALIERS, input.prompts)}, ${labelOf(GEO_ENGINE_PALIERS, input.engines)}, ` +
    `fréquence ${labelOf(GEO_FREQUENCY_PALIERS, input.frequency).toLowerCase()}\n` +
    `- Audits GEO complets : ${labelOf(GEO_AUDIT_PALIERS, input.audits)}\n` +
    `- Articles vidéo complets : ${labelOf(GEO_ARTICLE_PALIERS, input.videoArticles)}\n` +
    `- Articles basiques : ${labelOf(GEO_ARTICLE_PALIERS, input.basicArticles)}\n` +
    `- Doublages multilingues : ${labelOf(GEO_DUBBING_PALIERS, input.dubbings)}\n` +
    `- Analyses stratégiques / concepts : ${labelOf(GEO_STRATEGY_PALIERS, input.strategy)}\n` +
    `- Copilot : ${labelOf(GEO_COPILOT_PALIERS, input.copilot)}\n` +
    `\n` +
    `CONSOMMATION ESTIMÉE : ${integer.format(result.monthlyCredits)} crédits / mois ` +
    `(${percent.format(result.monthlyUsageRatio)} des ${integer.format(GEO_MONTHLY_CREDITS)} crédits mensuels inclus).\n` +
    result.lines
      .map(
        (line) =>
          `- ${line.label} : ${integer.format(line.credits)} crédits / mois ` +
          `(${percent.format(line.credits / result.monthlyCredits)})\n`
      )
      .join("") +
    `\n` +
    `COMPARAISON DES OFFRES (même volume : ${integer.format(GEO_MONTHLY_CREDITS)} crédits / mois, ` +
    `120 000 / an) :\n` +
    describeGeoQuote(result.quotes[result.recommended]) +
    describeGeoQuote(result.quotes[other]) +
    `\n` +
    `OFFRE RECOMMANDÉE : Aive GEO ${recommended.name}, soit ` +
    `${euros.format(result.quotes[result.recommended].totalCost)} / an.\n` +
    (result.recommended === "ACCOMPAGNEMENT"
      ? `Pourquoi l'accompagnement : ${result.reasons.join(", ")}.\n`
      : `Pourquoi le self-serve : le client a l'équipe et la maturité GEO pour exploiter ses crédits en autonomie.\n`) +
    `Rappels : 1 crédit = 1 action IA (${creditPrice.format(GEO_CREDIT_PRICE)}), le budget se pilote en temps réel ;\n` +
    `les crédits ne se reportent pas d'un mois sur l'autre mais se réallouent librement entre\n` +
    `monitoring, production et audits.\n` +
    `\n` +
    `Crée un deck de slides compact (une poignée de slides, visuelles, peu denses), structuré en\n` +
    `4 parties : Vos besoins, Votre consommation estimée, L'offre recommandée, Comparaison des\n` +
    `offres — pas un one-pager texte.\n` +
    `\n` +
    `CONTRAINTES DE MISE EN PAGE :\n` +
    `- Slide 1 : titre "PROPOSITION D'OFFRE AIVE GEO", avec en dessous un court sous-titre (1 à 2\n` +
    `  lignes) rappelant l'objectif du deck (dimensionner l'offre Aive GEO selon les besoins du prospect).\n` +
    `- Chaque partie tient sur une seule slide.\n` +
    `- La slide "L'offre recommandée" met en avant Aive GEO ${recommended.name} et son prix annuel en très gros.\n` +
    `- Utilise exactement les chiffres fournis : ne recalcule rien et n'invente aucun prix.\n` +
    `- Le seul prix du crédit à afficher est ${creditPrice.format(GEO_CREDIT_PRICE)} / crédit. N'affiche jamais de prix\n` +
    `  moyen ou « effectif » par crédit.`
  );
}
