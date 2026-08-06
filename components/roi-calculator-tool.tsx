"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgencyForm } from "@/components/roi/agency-form";
import { BrandForm } from "@/components/roi/brand-form";
import { RoiResults } from "@/components/roi/roi-results";
import {
  AGENCY_COST_DEFAULTS,
  AIVE_ANNUAL_COST_DEFAULTS,
  computeAgencyROI,
  computeBrandROI,
  type AgencyProductType,
  type AgencyROIInput,
  type BrandROIInput,
} from "@/lib/roi-calculator";

const DEFAULT_BRAND_INPUT: BrandROIInput = {
  agencyType: "CREA",
  annualVideoVolume: 144,
  agencyCost: AGENCY_COST_DEFAULTS.CREA,
  proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.videoGeneration,
};

// Défauts réalistes par offre (recherchés en ligne, cf. mémoire projet) :
// Aive — temps/taux d'une équipe créa/prod vidéo ; Aive GEO — temps/taux
// moyen d'une équipe SEO/contenu, mélangeant audits GEO (plus longs, plus
// rares) et rédaction d'articles GEO (plus courte, plus fréquente). Les
// volumes annuels sont des ordres de grandeur plausibles, à ajuster par le
// GP selon le prospect.
const DEFAULT_AGENCY_INPUT_BY_PRODUCT: Record<AgencyProductType, AgencyROIInput> = {
  Aive: {
    internalTimePerDeclinaison: 3,
    teamHourlyRate: 45,
    annualVolume: 500,
    proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.videoGeneration,
  },
  "Aive GEO": {
    internalTimePerDeclinaison: 6,
    teamHourlyRate: 55,
    annualVolume: 80,
    proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.geo,
  },
};

export function RoiCalculatorTool() {
  const [mode, setMode] = useState<"brand" | "agency">("brand");
  const [brandInput, setBrandInput] = useState<BrandROIInput>(DEFAULT_BRAND_INPUT);
  const [agencyProductType, setAgencyProductType] = useState<AgencyProductType>("Aive");
  const [agencyInput, setAgencyInput] = useState<AgencyROIInput>(
    DEFAULT_AGENCY_INPUT_BY_PRODUCT.Aive
  );

  const brandResult = computeBrandROI(brandInput);
  const agencyResult = computeAgencyROI(agencyInput);

  function handleAgencyProductTypeChange(productType: AgencyProductType) {
    if (productType === agencyProductType) return;

    const isUnchanged =
      JSON.stringify(agencyInput) ===
      JSON.stringify(DEFAULT_AGENCY_INPUT_BY_PRODUCT[agencyProductType]);
    if (
      !isUnchanged &&
      !window.confirm(
        "Changer d'offre remet les champs à leurs valeurs par défaut — les valeurs déjà saisies pour ce prospect seront perdues. Continuer ?"
      )
    ) {
      return;
    }

    setAgencyProductType(productType);
    setAgencyInput(DEFAULT_AGENCY_INPUT_BY_PRODUCT[productType]);
  }

  function handleReset() {
    if (mode === "brand") {
      setBrandInput(DEFAULT_BRAND_INPUT);
    } else {
      setAgencyInput(DEFAULT_AGENCY_INPUT_BY_PRODUCT[agencyProductType]);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Outil 3 — ROI Calculator &amp; Export tableau</CardTitle>
        <CardDescription>
          À utiliser pendant le rendez-vous de closing, pour calculer en direct le ROI
          et convaincre avec les chiffres du prospect. Aucun appel externe, tout se
          calcule dans ton navigateur.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as "brand" | "agency")}>
          <TabsList>
            <TabsTrigger value="brand">Marque</TabsTrigger>
            <TabsTrigger value="agency">Agence</TabsTrigger>
          </TabsList>
          <TabsContent value="brand" className="pt-4">
            <BrandForm input={brandInput} onChange={setBrandInput} />
          </TabsContent>
          <TabsContent value="agency" className="pt-4">
            <AgencyForm
              productType={agencyProductType}
              onProductTypeChange={handleAgencyProductTypeChange}
              input={agencyInput}
              onChange={setAgencyInput}
            />
          </TabsContent>
        </Tabs>

        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={handleReset}>
          Nouveau prospect
        </Button>

        {mode === "brand" ? (
          <RoiResults mode="brand" input={brandInput} result={brandResult} />
        ) : (
          <RoiResults
            mode="agency"
            input={agencyInput}
            result={agencyResult}
            agencyProductType={agencyProductType}
          />
        )}
      </CardContent>
    </Card>
  );
}
