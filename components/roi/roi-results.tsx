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
  AgencyProductType,
  AgencyROIInput,
  AgencyROIResult,
  BrandROIInput,
  BrandROIResult,
} from "@/lib/roi-calculator";
import { buildAgencyBreakEvenSeries, buildBrandBreakEvenSeries } from "@/lib/roi-chart-data";

type RoiResultsProps =
  | { mode: "brand"; input: BrandROIInput; result: BrandROIResult }
  | {
      mode: "agency";
      input: AgencyROIInput;
      result: AgencyROIResult;
      agencyProductType: AgencyProductType;
    };

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function formatCurrency(value: number | null): string {
  return value === null ? "—" : currencyFormatter.format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${numberFormatter.format(value)} %`;
}

function formatMonths(value: number | null): string {
  return value === null ? "—" : `${numberFormatter.format(value)} mois`;
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
      : [
          {
            name: "Coût actuel",
            value: Math.max(0, props.input.annualVolume * props.result.currentCostPerDeclinaison),
          },
          {
            name: "Coût avec Aive",
            value: Math.max(0, props.input.annualVolume * props.result.aiveCostPerDeclinaison),
          },
        ];

  const breakEvenSeries =
    props.mode === "brand"
      ? buildBrandBreakEvenSeries(props.input)
      : buildAgencyBreakEvenSeries(
          props.input,
          props.agencyProductType === "Aive GEO" ? "audits" : "déclinaisons"
        );

  function handleDownloadBarChart() {
    const svg = barChartRef.current ? findChartSvg(barChartRef.current) : null;
    if (svg) {
      downloadSvgAsPng(svg, `cout-annuel-${props.mode === "brand" ? "marque" : "agence"}.png`, {
        title: barChartTitle,
      });
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
              caption="Économie nette annuelle ÷ coût Aive × 100"
            />
            <PaybackCard
              value={formatMonths(props.result.paybackMonths)}
              caption="Coût Aive ÷ coût agence, ramené en mois"
            />
          </>
        ) : (
          <>
            <KpiCard
              label="Coût de production actuel (annuel)"
              value={formatCurrency(props.input.annualVolume * props.result.currentCostPerDeclinaison)}
            />
            <KpiCard
              label="Économie de production annuelle"
              value={formatCurrency(props.result.annualProductionSaving)}
            />
            <KpiCard
              label="ROI agence"
              value={formatPercent(props.result.roiPercent)}
              caption="Économie de production annuelle ÷ coût Aive × 100"
            />
            <PaybackCard
              value={formatMonths(props.result.paybackMonths)}
              caption="Coût Aive ÷ économie de production mensuelle"
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
        filename={`seuil-de-rentabilite-${props.mode === "brand" ? "marque" : "agence"}.png`}
      />
    </div>
  );
}
