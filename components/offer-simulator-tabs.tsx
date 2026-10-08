"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeoOfferSimulatorTool } from "@/components/geo-offer-simulator-tool";
import { OfferSimulatorTool } from "@/components/offer-simulator-tool";

type OfferProduct = "aive" | "geo";

export function OfferSimulatorTabs() {
  const [product, setProduct] = useState<OfferProduct>("aive");

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Outil 4 — Simulateur d&apos;offre</CardTitle>
        <CardDescription>
          Estime la consommation de crédits du prospect à partir de quelques fourchettes, et
          indique l&apos;offre à pousser. Clique sur « Générer » : un onglet Claude Design
          s&apos;ouvre et le prompt de la proposition d&apos;offre est copié dans ton
          presse-papier — colle-le (Cmd+V).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={product} onValueChange={(value) => setProduct(value as OfferProduct)}>
          <TabsList>
            <TabsTrigger value="aive">Aive</TabsTrigger>
            <TabsTrigger value="geo">Aive GEO</TabsTrigger>
          </TabsList>
          {/* keepMounted : chaque onglet conserve sa saisie quand on bascule. */}
          <TabsContent value="aive" className="pt-4" keepMounted>
            <OfferSimulatorTool />
          </TabsContent>
          <TabsContent value="geo" className="pt-4" keepMounted>
            <GeoOfferSimulatorTool />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
