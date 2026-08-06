"use client";

import { useRef } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIVE_CHART_COLOR, BREAK_EVEN_MARKER_COLOR, REFERENCE_CHART_COLOR } from "@/lib/chart-colors";
import { downloadSvgAsPng, findChartSvg } from "@/lib/export-chart";
import type { BreakEvenSeries } from "@/lib/roi-chart-data";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function BreakEvenChart({
  series,
  filename,
}: {
  series: BreakEvenSeries;
  filename: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const title = `Seuil de rentabilité (coût par ${series.quantityLabel})`;

  const breakEvenQuantity =
    series.breakEvenQuantity !== null ? Math.round(series.breakEvenQuantity) : null;
  // Coût au seuil : identique sur les deux courbes par construction, on le lit
  // sur la courbe Aive du point le plus proche pour placer le marqueur.
  const breakEvenCost =
    breakEvenQuantity !== null
      ? series.points.reduce((closest, point) =>
          Math.abs(point.quantity - breakEvenQuantity) <
          Math.abs(closest.quantity - breakEvenQuantity)
            ? point
            : closest
        ).aiveCost
      : null;

  function handleDownload() {
    const svg = containerRef.current ? findChartSvg(containerRef.current) : null;
    if (svg) {
      downloadSvgAsPng(svg, filename, {
        title,
        legend: [
          { label: "Coût sans Aive", color: REFERENCE_CHART_COLOR },
          { label: "Coût avec Aive", color: AIVE_CHART_COLOR },
        ],
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {breakEvenQuantity !== null && (
          <p className="text-sm text-muted-foreground">
            Rentable à partir de{" "}
            <span className="font-medium text-foreground">
              {numberFormatter.format(breakEvenQuantity)} {series.quantityLabel}
            </span>
            .
          </p>
        )}
        <div className="h-64 w-full" ref={containerRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.points} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="quantity"
                type="number"
                domain={[0, "dataMax"]}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => numberFormatter.format(Number(value))}
                label={{ value: series.quantityLabel, position: "insideBottom", offset: -10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value) => currencyFormatter.format(Number(value))}
              />
              <Tooltip
                formatter={(value) => currencyFormatter.format(Number(value))}
                labelFormatter={(value) => `${numberFormatter.format(Number(value))} ${series.quantityLabel}`}
              />
              <Legend verticalAlign="top" height={32} />
              {breakEvenQuantity !== null && (
                <ReferenceLine
                  x={breakEvenQuantity}
                  stroke={BREAK_EVEN_MARKER_COLOR}
                  strokeDasharray="4 4"
                  label={{
                    value: `Rentable à ${numberFormatter.format(breakEvenQuantity)} ${series.quantityLabel}`,
                    position: "top",
                    fill: BREAK_EVEN_MARKER_COLOR,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}
              {breakEvenQuantity !== null && breakEvenCost !== null && (
                <ReferenceDot
                  x={breakEvenQuantity}
                  y={breakEvenCost}
                  r={5}
                  fill={BREAK_EVEN_MARKER_COLOR}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
              <Line
                type="monotone"
                dataKey="referenceCost"
                name="Coût sans Aive"
                stroke={REFERENCE_CHART_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="aiveCost"
                name="Coût avec Aive"
                isAnimationActive={false}
                stroke={AIVE_CHART_COLOR}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={handleDownload}>
          Télécharger le graphique
        </Button>
      </CardContent>
    </Card>
  );
}
