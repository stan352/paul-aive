export const TARGET_SOLUTIONS = ["Aive", "Aive GEO", "Aive + Aive GEO"] as const;

export const CLIENT_SEGMENTS = ["Agences", "Marques", "Media & Networks"] as const;

export type TargetSolution = (typeof TARGET_SOLUTIONS)[number];
export type ClientSegment = (typeof CLIENT_SEGMENTS)[number];

export interface OpportunityPromptInput {
  gpProfile: string;
  clientUrl: string;
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

export function buildOpportunityPrompt({ gpProfile, clientUrl }: OpportunityPromptInput): string {
  return (
    `Fais une recherche en ligne sur le prospect ${clientUrl} (Google Actualités, LinkedIn, son\n` +
    `site, sa presse) pour trouver 3 à 5 opportunités commerciales exploitables par le Growth\n` +
    `Partner ${gpProfile} : lancement produit, campagne marketing, expansion, recrutement clé,\n` +
    `changement organisationnel. Pour chacune, explique en une phrase pourquoi elle est\n` +
    `exploitable commercialement.\n` +
    `\n` +
    `Nous vendons uniquement deux offres, à recommander séparément ou ensemble selon le\n` +
    `prospect :\n` +
    `- Aive : génération vidéo IA pour produire des déclinaisons marketing/vidéo à grande échelle.\n` +
    `- Aive GEO : audit et optimisation de la visibilité de la marque dans les réponses des moteurs\n` +
    `  IA (AEO/GEO — Answer Engine / Generative Engine Optimization).\n` +
    `\n` +
    `Construis un plan pour le rendez-vous de pitch client, couvrant 3 scénarios de vente : Aive\n` +
    `seul, Aive GEO seul, et Aive + Aive GEO ensemble. Pour chaque scénario : la justification du\n` +
    `choix au vu des opportunités identifiées, un script d'amorce, les points de discussion à\n` +
    `dérouler, et des questions de qualification.\n` +
    `\n` +
    `Crée quelques slides avec ces informations — pas de texte structuré, un support visuel prêt\n` +
    `pour le rendez-vous.\n` +
    `\n` +
    `CONTRAINTE DE MISE EN PAGE : Slide 1, titre "RDV PITCH", avec en dessous un court\n` +
    `sous-titre (1 à 2 lignes) rappelant l'objectif de ce pitch et le contenu du deck\n` +
    `(opportunités identifiées, offre recommandée, plan d'action).`
  );
}
