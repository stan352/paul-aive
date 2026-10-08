"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratedPromptResult } from "@/components/generated-prompt-result";
import { InfoTip } from "@/components/info-tip";
import { PalierSelect } from "@/components/offer-simulator-tool";
import { openClaudeDesignWithPrompt } from "@/lib/claude-design";
import { buildGeoOfferPrompt } from "@/lib/prompt-templates";
import {
  GEO_ARTICLE_PALIERS,
  GEO_AUDIT_PALIERS,
  GEO_COPILOT_PALIERS,
  GEO_CREDIT_PRICE,
  GEO_TRANSLATION_PALIERS,
  GEO_ENGINE_PALIERS,
  GEO_EXPERIENCE_OPTIONS,
  GEO_FREQUENCY_PALIERS,
  GEO_MARKET_OPTIONS,
  GEO_MONTHLY_CREDITS,
  GEO_PLANS,
  GEO_PROMPT_PALIERS,
  GEO_TEAM_OPTIONS,
  computeGeoSimulation,
  type GeoPlanId,
  type GeoPlanQuote,
  type GeoSimulatorInput,
} from "@/lib/geo-offer-simulator";

const DEFAULT_INPUT: GeoSimulatorInput = {
  prompts: "50-150",
  engines: "5",
  frequency: "weekly",
  audits: "1-2",
  videoArticles: "1-5",
  basicArticles: "6-20",
  translations: "0",
  copilot: "medium",
  team: "partial",
  experience: "basic",
  markets: "1",
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const creditPriceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 0,
});

const PLAN_DESCRIPTIONS: Record<GeoPlanId, string> = {
  SELF_SERVE: "Le client pilote seul ses crédits sur la plateforme.",
  ACCOMPAGNEMENT: "Les équipes Aive accompagnent le client dans sa stratégie GEO.",
};

function GeoPlanCard({
  quote,
  recommended,
  usageRatio,
}: {
  quote: GeoPlanQuote;
  recommended: boolean;
  usageRatio: number;
}) {
  const plan = GEO_PLANS[quote.plan];
  return (
    <Card className={recommended ? "border-2 border-primary bg-primary/5" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{plan.name}</span>
          {recommended && (
            <span className="rounded-full bg-gradient-aive px-2 py-0.5 text-xs font-medium text-white">
              À pousser
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {numberFormatter.format(GEO_MONTHLY_CREDITS)} crédits / mois ·{" "}
          {currencyFormatter.format(plan.annualPrice)} / an
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p
          className={"text-2xl font-semibold " + (recommended ? "text-primary" : "text-foreground")}
        >
          {currencyFormatter.format(quote.totalCost)}
          <span className="text-sm font-normal text-muted-foreground"> / an</span>
        </p>

        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={
                "h-full rounded-full " + (usageRatio > 1 ? "bg-destructive" : "bg-gradient-aive")
              }
              style={{ width: `${Math.min(100, usageRatio * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {percentFormatter.format(usageRatio)} des crédits mensuels consommés
          </p>
        </div>

        <ul className="flex flex-col gap-1 text-xs">
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Abonnement annuel</span>
            <span>{currencyFormatter.format(quote.basePrice)}</span>
          </li>
          {quote.extraCredits > 0 && (
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                Dépassement : {numberFormatter.format(quote.extraCredits)} crédits / an ×{" "}
                {creditPriceFormatter.format(GEO_CREDIT_PRICE)}
              </span>
              <span>{currencyFormatter.format(quote.extraCreditsCost)}</span>
            </li>
          )}
        </ul>

        <p className="text-xs text-muted-foreground">{PLAN_DESCRIPTIONS[quote.plan]}</p>
      </CardContent>
    </Card>
  );
}

type GenerationState =
  | { status: "idle" }
  | { status: "done"; prompt: string; copied: boolean };

export function GeoOfferSimulatorTool() {
  const [input, setInput] = useState<GeoSimulatorInput>(DEFAULT_INPUT);
  const [prospect, setProspect] = useState("");
  const [generation, setGeneration] = useState<GenerationState>({ status: "idle" });
  const result = computeGeoSimulation(input);
  const monitoringOn = input.prompts !== "0";

  function update<K extends keyof GeoSimulatorInput>(key: K, value: GeoSimulatorInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
  }

  function handleReset() {
    setInput(DEFAULT_INPUT);
    setProspect("");
    setGeneration({ status: "idle" });
  }

  function handleGenerate() {
    const prompt = buildGeoOfferPrompt({ prospect, input, result });

    openClaudeDesignWithPrompt(prompt, (copied) => {
      setGeneration({ status: "done", prompt, copied });
    });

    setGeneration({ status: "done", prompt, copied: false });
  }

  const reason =
    result.recommended === "ACCOMPAGNEMENT"
      ? `Client peu autonome sur le GEO : ${result.reasons.join(", ")}.`
      : "Le client a l'équipe et la maturité pour exploiter ses crédits en autonomie.";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="geo-prospect">Prospect (optionnel)</Label>
        <Input
          id="geo-prospect"
          placeholder="Nom ou site du prospect, ex. https://www.peugeot.fr/"
          value={prospect}
          onChange={(event) => setProspect(event.target.value)}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 flex items-center gap-1 text-sm font-medium">
          Usage mensuel
          <InfoTip label="Méthode de calcul des crédits">
            <p className="mb-1.5 font-medium">Calcul des crédits / mois</p>
            <ul className="flex list-disc flex-col gap-1 pl-4">
              <li>Monitoring = prompts × moteurs × exécutions par mois × 1 crédit.</li>
              <li>Audit GEO complet = 50 crédits (5 moteurs × 10 prompts).</li>
              <li>Article vidéo complet = 25 crédits ; article basique = 5 crédits.</li>
              <li>Traduction du texte = 8 crédits.</li>
              <li>Message Copilot, GEO scoring = 1 crédit.</li>
            </ul>
            <p className="mt-1.5 text-muted-foreground">
              Chaque fourchette est prise en son milieu. Les crédits ne se reportent pas
              d&apos;un mois sur l&apos;autre : le dépassement se calcule chaque mois, à{" "}
              {creditPriceFormatter.format(GEO_CREDIT_PRICE)} / crédit.
            </p>
          </InfoTip>
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <PalierSelect
            id="geo-prompts"
            label="Prompts suivis en monitoring"
            value={input.prompts}
            options={GEO_PROMPT_PALIERS}
            onChange={(value) => update("prompts", value)}
          />
          {monitoringOn && (
            <PalierSelect
              id="geo-engines"
              label="Moteurs IA suivis"
              value={input.engines}
              options={GEO_ENGINE_PALIERS}
              onChange={(value) => update("engines", value)}
            />
          )}
          {monitoringOn && (
            <PalierSelect
              id="geo-frequency"
              label="Fréquence du monitoring"
              value={input.frequency}
              options={GEO_FREQUENCY_PALIERS}
              onChange={(value) => update("frequency", value)}
            />
          )}
          <PalierSelect
            id="geo-audits"
            label="Audits GEO complets"
            value={input.audits}
            options={GEO_AUDIT_PALIERS}
            onChange={(value) => update("audits", value)}
          />
          <PalierSelect
            id="geo-video-articles"
            label="Articles vidéo complets"
            value={input.videoArticles}
            options={GEO_ARTICLE_PALIERS}
            onChange={(value) => update("videoArticles", value)}
          />
          <PalierSelect
            id="geo-basic-articles"
            label="Articles basiques"
            value={input.basicArticles}
            options={GEO_ARTICLE_PALIERS}
            onChange={(value) => update("basicArticles", value)}
          />
          <PalierSelect
            id="geo-translations"
            label="Traductions du texte"
            value={input.translations}
            options={GEO_TRANSLATION_PALIERS}
            onChange={(value) => update("translations", value)}
          />
          <PalierSelect
            id="geo-copilot"
            label="Messages Copilot et GEO scorings"
            value={input.copilot}
            options={GEO_COPILOT_PALIERS}
            onChange={(value) => update("copilot", value)}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Maturité du client</legend>
        <p className="-mt-2 text-xs text-muted-foreground">
          Les deux offres incluent les mêmes crédits : c&apos;est la maturité du client qui
          décide entre self-serve et accompagnement.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <PalierSelect
            id="geo-team"
            label="Équipe SEO / contenu en interne ?"
            value={input.team}
            options={GEO_TEAM_OPTIONS}
            onChange={(value) => update("team", value)}
          />
          <PalierSelect
            id="geo-experience"
            label="Expérience GEO / AEO"
            value={input.experience}
            options={GEO_EXPERIENCE_OPTIONS}
            onChange={(value) => update("experience", value)}
          />
          <PalierSelect
            id="geo-markets"
            label="Marchés / langues à couvrir"
            value={input.markets}
            options={GEO_MARKET_OPTIONS}
            onChange={(value) => update("markets", value)}
          />
        </div>
      </fieldset>

      <Card className="bg-muted/40">
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Consommation estimée</p>
          <p className="text-3xl font-semibold">
            {numberFormatter.format(result.monthlyCredits)}{" "}
            <span className="text-base font-normal text-muted-foreground">crédits / mois</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {percentFormatter.format(result.monthlyUsageRatio)} des{" "}
            {numberFormatter.format(GEO_MONTHLY_CREDITS)} crédits mensuels inclus ·{" "}
            {numberFormatter.format(result.annualCredits)} crédits / an
          </p>
          {result.monthlyUsageRatio > 1 && (
            <p className="text-xs text-destructive">
              Au-delà de {numberFormatter.format(GEO_MONTHLY_CREDITS)} crédits / mois : dépassement
              facturé à {creditPriceFormatter.format(GEO_CREDIT_PRICE)} / crédit.
            </p>
          )}
          {result.monthlyUsageRatio < 0.3 && (
            <p className="text-xs text-muted-foreground">
              Usage faible : les crédits non consommés sont perdus chaque mois — pousse le client à
              élargir le monitoring ou la production.
            </p>
          )}
          <p className="mt-2 text-sm">
            <span className="font-medium">
              Offre à pousser : Aive GEO {GEO_PLANS[result.recommended].name}.
            </span>{" "}
            {reason}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(GEO_PLANS) as GeoPlanId[]).map((plan) => (
          <GeoPlanCard
            key={plan}
            quote={result.quotes[plan]}
            recommended={result.recommended === plan}
            usageRatio={result.monthlyUsageRatio}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Détail de la consommation mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {result.lines.map((line) => (
                <tr key={line.label} className="border-b border-border/60 last:border-0">
                  <td className="py-1.5 text-muted-foreground">{line.label}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {numberFormatter.format(line.credits)}
                  </td>
                  <td className="py-1.5 pl-3 text-right text-xs text-muted-foreground tabular-nums">
                    {percentFormatter.format(line.credits / result.monthlyCredits)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleGenerate} className="bg-gradient-aive text-white hover:opacity-90">
          Générer
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          Réinitialiser les champs
        </Button>
      </div>

      {generation.status === "done" && (
        <GeneratedPromptResult prompt={generation.prompt} initiallyCopied={generation.copied} />
      )}

      <p className="text-xs text-muted-foreground">
        * Calcul sur le milieu de chaque fourchette. Les deux offres incluent 120 000 crédits / an
        (10 000 / mois, non reportables d&apos;un mois sur l&apos;autre). Accompagnement poussé si le
        client n&apos;a pas d&apos;équipe SEO / contenu, ou si son score de maturité est faible.
        Grille : slide « The Aive GEO credit » (1 crédit = {creditPriceFormatter.format(GEO_CREDIT_PRICE)}).
      </p>
    </div>
  );
}
