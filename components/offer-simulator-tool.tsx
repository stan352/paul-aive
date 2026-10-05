"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratedPromptResult } from "@/components/generated-prompt-result";
import { openClaudeDesignWithPrompt } from "@/lib/claude-design";
import { buildOfferPrompt } from "@/lib/prompt-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANALYSIS_MODELS,
  CREDIT_PACK_PRICE,
  DECLINAISON_PALIERS,
  DURATION_PALIERS,
  OFFER_PLAN_FEATURES,
  PLANS,
  PRO_TO_ENTERPRISE_CREDIT_THRESHOLD,
  USAGE_PROFILES,
  USER_PALIERS,
  VIDEO_VOLUME_PALIERS,
  computeOfferSimulation,
  type OfferSimulatorInput,
  type PlanId,
  type PlanQuote,
  type UsageProfileId,
} from "@/lib/offer-simulator";

const DEFAULT_INPUT: OfferSimulatorInput = {
  videoVolume: "100-500",
  duration: "1-5",
  analysisModel: "M",
  usageProfile: "declinaisons",
  declinaisons: "4-10",
  users: "1-10",
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
  maximumFractionDigits: 3,
});
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 0,
});

function PalierSelect<Id extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: Id;
  options: readonly { id: Id; label: string }[];
  onChange: (value: Id) => void;
}) {
  const items = Object.fromEntries(options.map((option) => [option.id, option.label]));
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select items={items} value={value} onValueChange={(next) => onChange(next as Id)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const USAGE_PROFILE_OPTIONS = (Object.keys(USAGE_PROFILES) as UsageProfileId[]).map((id) => ({
  id,
  label: USAGE_PROFILES[id].label,
}));

function PlanCard({ quote, recommended }: { quote: PlanQuote; recommended: boolean }) {
  const plan = PLANS[quote.plan];
  const usageWidth = Math.min(100, quote.includedUsageRatio * 100);
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
          {numberFormatter.format(plan.includedCredits)} crédits inclus ·{" "}
          {currencyFormatter.format(plan.annualPrice)} / an
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {quote.eligible ? (
          <>
            <p
              className={
                "text-2xl font-semibold " + (recommended ? "text-primary" : "text-foreground")
              }
            >
              {currencyFormatter.format(quote.totalCost)}
              <span className="text-sm font-normal text-muted-foreground"> / an</span>
            </p>

            <div className="flex flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    "h-full rounded-full " +
                    (quote.includedUsageRatio > 1 ? "bg-destructive" : "bg-gradient-aive")
                  }
                  style={{ width: `${usageWidth}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {percentFormatter.format(quote.includedUsageRatio)} des crédits inclus consommés
              </p>
            </div>

            <ul className="flex flex-col gap-1 text-xs">
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">Plan annuel</span>
                <span>{currencyFormatter.format(quote.basePrice)}</span>
              </li>
              {quote.extraCredits > 0 && (
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    Packs : {numberFormatter.format(quote.extraCredits)} crédits ×{" "}
                    {creditPriceFormatter.format(CREDIT_PACK_PRICE)}
                  </span>
                  <span>{currencyFormatter.format(quote.extraCreditsCost)}</span>
                </li>
              )}
              {quote.usersPacks > 0 && (
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {quote.usersPacks} × augmentation{" "}
                    {quote.plan === "PRO" ? "10 users" : "300 users"}
                  </span>
                  <span>{currencyFormatter.format(quote.usersCost)}</span>
                </li>
              )}
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">Prix effectif du crédit</span>
                <span>{creditPriceFormatter.format(quote.effectiveCreditPrice)}</span>
              </li>
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hors périmètre : le PRO est limité à 10 utilisateurs actifs par jour (+10 par
            option à 3 k€). Au-delà de 50 utilisateurs, passer en ENTERPRISE.
          </p>
        )}

        <ul className="flex flex-wrap gap-1">
          {OFFER_PLAN_FEATURES[quote.plan].map((feature) => (
            <li
              key={feature}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function recommendationReason(
  recommended: PlanId,
  totalCredits: number,
  proEligible: boolean
): string {
  if (recommended === "ENTERPRISE" && !proEligible) {
    return "Le nombre d'utilisateurs dépasse ce que le PRO peut couvrir.";
  }
  if (recommended === "ENTERPRISE") {
    return totalCredits >= PRO_TO_ENTERPRISE_CREDIT_THRESHOLD
      ? `Au-delà d'environ ${numberFormatter.format(PRO_TO_ENTERPRISE_CREDIT_THRESHOLD)} crédits / an, PRO + packs coûte plus cher que l'ENTERPRISE.`
      : "Avec les options utilisateurs, l'ENTERPRISE revient moins cher que le PRO.";
  }
  if (totalCredits <= PLANS.PRO.includedCredits) {
    return "Le volume tient dans les 30 000 crédits inclus du PRO.";
  }
  return `Le PRO + packs de crédits reste moins cher que l'ENTERPRISE jusqu'à environ ${numberFormatter.format(PRO_TO_ENTERPRISE_CREDIT_THRESHOLD)} crédits / an.`;
}

type GenerationState =
  | { status: "idle" }
  | { status: "done"; prompt: string; copied: boolean };

export function OfferSimulatorTool() {
  const [input, setInput] = useState<OfferSimulatorInput>(DEFAULT_INPUT);
  const [prospect, setProspect] = useState("");
  const [generation, setGeneration] = useState<GenerationState>({ status: "idle" });
  const result = computeOfferSimulation(input);
  const profile = USAGE_PROFILES[input.usageProfile];

  function update<K extends keyof OfferSimulatorInput>(key: K, value: OfferSimulatorInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
  }

  function handleReset() {
    setInput(DEFAULT_INPUT);
    setProspect("");
    setGeneration({ status: "idle" });
  }

  function handleGenerate() {
    const prompt = buildOfferPrompt({ prospect, input, result });

    openClaudeDesignWithPrompt(prompt, (copied) => {
      setGeneration({ status: "done", prompt, copied });
    });

    setGeneration({ status: "done", prompt, copied: false });
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Outil 4 — Simulateur d&apos;offre</CardTitle>
        <CardDescription>
          Estime la consommation annuelle de crédits du prospect à partir de quelques
          fourchettes, et indique l&apos;offre à pousser (PRO ou ENTERPRISE). Clique sur
          « Générer » : un onglet Claude Design s&apos;ouvre et le prompt de la proposition
          d&apos;offre est copié dans ton presse-papier — colle-le (Cmd+V).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="offer-prospect">Prospect (optionnel)</Label>
          <Input
            id="offer-prospect"
            placeholder="Nom ou site du prospect, ex. https://www.peugeot.fr/"
            value={prospect}
            onChange={(event) => setProspect(event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PalierSelect
            id="video-volume"
            label="Volume de vidéos traitées par an"
            value={input.videoVolume}
            options={VIDEO_VOLUME_PALIERS}
            onChange={(value) => update("videoVolume", value)}
          />
          <PalierSelect
            id="video-duration"
            label="Durée moyenne d'une vidéo"
            value={input.duration}
            options={DURATION_PALIERS}
            onChange={(value) => update("duration", value)}
          />
          <PalierSelect
            id="usage-profile"
            label="Profil d'usage"
            value={input.usageProfile}
            options={USAGE_PROFILE_OPTIONS}
            onChange={(value) => update("usageProfile", value)}
          />
          {input.usageProfile !== "analysis" && (
            <PalierSelect
              id="declinaisons"
              label="Déclinaisons générées par vidéo"
              value={input.declinaisons}
              options={DECLINAISON_PALIERS}
              onChange={(value) => update("declinaisons", value)}
            />
          )}
          <PalierSelect
            id="analysis-model"
            label="Modèle d'analyse"
            value={input.analysisModel}
            options={ANALYSIS_MODELS}
            onChange={(value) => update("analysisModel", value)}
          />
          <PalierSelect
            id="users"
            label="Utilisateurs actifs côté client"
            value={input.users}
            options={USER_PALIERS}
            onChange={(value) => update("users", value)}
          />
        </div>
        <p className="-mt-3 text-xs text-muted-foreground">{profile.description}</p>

        <Card className="bg-muted/40">
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Consommation estimée</p>
            <p className="text-3xl font-semibold">
              {numberFormatter.format(result.totalCredits)}{" "}
              <span className="text-base font-normal text-muted-foreground">crédits / an</span>
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ {numberFormatter.format(result.videos)} vidéos ·{" "}
              {numberFormatter.format(result.totalMinutes / 60)} h de contenu analysé · offre
              recommandée : {currencyFormatter.format(result.costPerVideo)} / vidéo
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Offre à pousser : {result.recommended}.</span>{" "}
              {recommendationReason(
                result.recommended,
                result.totalCredits,
                result.quotes.PRO.eligible
              )}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard quote={result.quotes.PRO} recommended={result.recommended === "PRO"} />
          <PlanCard
            quote={result.quotes.ENTERPRISE}
            recommended={result.recommended === "ENTERPRISE"}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Détail de la consommation</CardTitle>
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
                      {percentFormatter.format(line.credits / result.totalCredits)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            className="bg-gradient-aive text-white hover:opacity-90"
          >
            Générer
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Nouveau prospect
          </Button>
        </div>

        {generation.status === "done" && (
          <GeneratedPromptResult prompt={generation.prompt} initiallyCopied={generation.copied} />
        )}

        <p className="text-xs text-muted-foreground">
          * Calcul sur le milieu de chaque fourchette (haut de fourchette pour les
          utilisateurs). Analyse = durée × crédits/min du modèle. Chaque déclinaison est
          supposée courte (≤ 1 min 30 → AI AutoGen short à 2 crédits). Dépassement en packs à{" "}
          {creditPriceFormatter.format(CREDIT_PACK_PRICE)} / crédit ; les crédits annuels non
          consommés se reportent. Grille : « Grille tarifaire AIVE - 09/10 ».
        </p>
      </CardContent>
    </Card>
  );
}
