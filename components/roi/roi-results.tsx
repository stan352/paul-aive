"use client";

import { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakEvenChart } from "@/components/roi/breakeven-chart";
import { AIVE_CHART_COLOR } from "@/lib/chart-colors";
import { downloadSvgAsPng, findChartSvg } from "@/lib/export-chart";
import type {
  AgencyGeoROIInput,
  AgencyGeoROIResult,
  AgencyROIInput,
  AgencyROIResult,
  BrandROIInput,
  BrandROIResult,
} from "@/lib/roi-calculator";
import {
  buildAgencyBreakEvenSeries,
  buildAgencyGeoBreakEvenSeries,
  buildBrandBreakEvenSeries,
} from "@/lib/roi-chart-data";

type RoiResultsProps =
  | { mode: "brand"; input: BrandROIInput; result: BrandROIResult }
  | { mode: "agency-video"; input: AgencyROIInput; result: AgencyROIResult }
  | { mode: "agency-geo"; input: AgencyGeoROIInput; result: AgencyGeoROIResult };

const BREAKEVEN_NOTES = {
  brandCrea:
    "Coût sans Aive = coût agence par déclinaison. Coût avec Aive = coût Aive annuel ÷ nombre de déclinaisons.",
  brandGeo:
    "Coût sans Aive = (coût agence mensuel × 12) ÷ volume annuel de livrables. Coût avec Aive = coût Aive annuel ÷ nombre de livrables.",
  agencyVideo:
    "Coût sans Aive = temps interne × taux horaire. Coût avec Aive = (temps interne × 15 %) × taux horaire + coût Aive annuel ÷ nombre de déclinaisons.",
  agencyGeo:
    "Coût sans Aive = (temps × taux horaire) pondéré par les volumes d'audits et d'articles, ÷ volume total. Coût avec Aive = même calcul avec le temps résiduel (15 %) + coût Aive annuel ÷ nombre de livrables.",
} as const;

const BAR_CHART_NOTES = {
  brandCrea: "Coût agence = coût par déclinaison × volume annuel produit. Coût Aive = abonnement annuel proposé.",
  brandGeo: "Coût agence = forfait mensuel de l'agence × 12. Coût Aive = abonnement annuel proposé.",
  agencyVideo:
    "Coût actuel = temps interne × taux horaire × volume annuel. Coût avec Aive = (temps résiduel × taux horaire + abonnement Aive ÷ volume) × volume annuel.",
  agencyGeo:
    "Coût actuel et coût avec Aive additionnent audits et articles GEO, chacun avec son propre temps de production et son propre volume annuel.",
} as const;

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const monthsFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

function formatCurrency(value: number | null): string {
  return value === null ? "—" : currencyFormatter.format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${numberFormatter.format(value)} %`;
}

function formatMonths(value: number | null): string {
  return value === null ? "—" : `${monthsFormatter.format(value)} mois`;
}

const UNAVAILABLE_CAPTION =
  "Impossible à calculer — vérifie qu'aucun coût saisi n'est à 0.";

function captionFor(rawValue: number | null, normalCaption: string): string {
  return rawValue === null ? UNAVAILABLE_CAPTION : normalCaption;
}

function KpiCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-2xl font-semibold">{value}</p>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </CardContent>
    </Card>
  );
}

function PaybackCard({ value, caption }: { value: string; caption?: string }) {
  return (
    <Card className="border-2 border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Rentabilisé en
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-2xl font-semibold text-primary">{value}</p>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </CardContent>
    </Card>
  );
}

export function RoiResults(props: RoiResultsProps) {
  const barChartRef = useRef<HTMLDivElement>(null);
  const barChartTitle = "Coût actuel vs coût avec Aive (annuel)";

  const chartData =
    props.mode === "brand"
      ? [
          { name: "Coût agence", value: Math.max(0, props.result.agencyAnnualCost) },
          { name: "Coût Aive", value: Math.max(0, props.input.proposedAiveAnnualCost) },
        ]
      : props.mode === "agency-video"
        ? [
            {
              name: "Coût actuel",
              value: Math.max(0, props.input.annualVolume * props.result.currentCostPerDeclinaison),
            },
            {
              name: "Coût avec Aive",
              value: Math.max(0, props.input.annualVolume * props.result.aiveCostPerDeclinaison),
            },
          ]
        : [
            { name: "Coût actuel", value: Math.max(0, props.result.currentAnnualCost) },
            { name: "Coût avec Aive", value: Math.max(0, props.result.aiveAnnualCost) },
          ];

  const breakEvenSeries =
    props.mode === "brand"
      ? buildBrandBreakEvenSeries(props.input)
      : props.mode === "agency-video"
        ? buildAgencyBreakEvenSeries(props.input)
        : buildAgencyGeoBreakEvenSeries(props.input);

  const fileSlug =
    props.mode === "brand" ? "marque" : props.mode === "agency-video" ? "agence-video" : "agence-geo";

  const breakEvenNote =
    props.mode === "brand"
      ? props.input.agencyType === "GEO"
        ? BREAKEVEN_NOTES.brandGeo
        : BREAKEVEN_NOTES.brandCrea
      : props.mode === "agency-video"
        ? BREAKEVEN_NOTES.agencyVideo
        : BREAKEVEN_NOTES.agencyGeo;

  const barChartNote =
    props.mode === "brand"
      ? props.input.agencyType === "GEO"
        ? BAR_CHART_NOTES.brandGeo
        : BAR_CHART_NOTES.brandCrea
      : props.mode === "agency-video"
        ? BAR_CHART_NOTES.agencyVideo
        : BAR_CHART_NOTES.agencyGeo;

  function handleDownloadBarChart() {
    const svg = barChartRef.current ? findChartSvg(barChartRef.current) : null;
    if (svg) {
      downloadSvgAsPng(svg, `cout-annuel-${fileSlug}.png`, { title: barChartTitle, note: barChartNote });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {props.mode === "brand" ? (
          <>
            <KpiCard label="Coût agence annuel" value={formatCurrency(props.result.agencyAnnualCost)} />
            <KpiCard
              label="Économie nette annuelle"
              value={formatCurrency(props.result.netAnnualSaving)}
            />
            <KpiCard
              label="ROI"
              value={formatPercent(props.result.roiPercent)}
              caption={captionFor(props.result.roiPercent, "Économie nette annuelle ÷ coût Aive × 100")}
            />
            <PaybackCard
              value={formatMonths(props.result.paybackMonths)}
              caption={captionFor(props.result.paybackMonths, "Coût Aive ÷ coût agence, ramené en mois")}
            />
          </>
        ) : (
          <>
            <KpiCard
              label="Coût de production actuel (annuel)"
              value={formatCurrency(
                props.mode === "agency-video"
                  ? props.input.annualVolume * props.result.currentCostPerDeclinaison
                  : props.result.currentAnnualCost
              )}
            />
            <KpiCard
              label="Économie de production annuelle"
              value={formatCurrency(props.result.annualProductionSaving)}
            />
            <KpiCard
              label="ROI agence"
              value={formatPercent(props.result.roiPercent)}
              caption={captionFor(
                props.result.roiPercent,
                "Économie de production annuelle ÷ coût Aive × 100"
              )}
            />
            <PaybackCard
              value={formatMonths(props.result.paybackMonths)}
              caption={captionFor(
                props.result.paybackMonths,
                "Coût Aive ÷ économie de production mensuelle"
              )}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {barChartTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-64 w-full" ref={barChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={(value) => currencyFormatter.format(Number(value))}
                />
                <Tooltip formatter={(value) => currencyFormatter.format(Number(value))} />
                <Bar
                  dataKey="value"
                  fill={AIVE_CHART_COLOR}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">* {barChartNote}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={handleDownloadBarChart}
          >
            Télécharger le graphique
          </Button>
        </CardContent>
      </Card>

      <BreakEvenChart
        series={breakEvenSeries}
        filename={`seuil-de-rentabilite-${fileSlug}.png`}
        note={breakEvenNote}
      />
    </div>
  );
}
