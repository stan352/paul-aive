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
  computeAgencyGeoROI,
  computeAgencyROI,
  computeBrandROI,
  type AgencyGeoROIInput,
  type AgencyProductType,
  type AgencyROIInput,
  type BrandROIInput,
} from "@/lib/roi-calculator";

const DEFAULT_BRAND_INPUT: BrandROIInput = {
  agencyType: "CREA",
  annualVideoVolume: 144,
  annualGeoVolume: 80,
  agencyCost: AGENCY_COST_DEFAULTS.CREA,
  proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.videoGeneration,
};

// Défauts réalistes par offre (recherchés en ligne, cf. mémoire projet) :
// Aive — temps/taux d'une équipe créa/prod vidéo.
const DEFAULT_AGENCY_VIDEO_INPUT: AgencyROIInput = {
  internalTimePerDeclinaison: 3,
  teamHourlyRate: 45,
  annualVolume: 500,
  proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.videoGeneration,
};

// Aive GEO — audit GEO (plus long, plus rare) et rédaction d'article GEO
// (plus courte, plus fréquente) traités séparément, chacun avec son propre
// temps de production et son propre volume annuel.
const DEFAULT_AGENCY_GEO_INPUT: AgencyGeoROIInput = {
  internalTimePerArticle: 3,
  internalTimePerAudit: 12,
  teamHourlyRate: 55,
  annualArticleVolume: 60,
  annualAuditVolume: 20,
  proposedAiveAnnualCost: AIVE_ANNUAL_COST_DEFAULTS.geo,
};

export function RoiCalculatorTool() {
  const [mode, setMode] = useState<"brand" | "agency">("brand");
  const [brandInput, setBrandInput] = useState<BrandROIInput>(DEFAULT_BRAND_INPUT);
  const [agencyProductType, setAgencyProductType] = useState<AgencyProductType>("Aive");
  const [agencyVideoInput, setAgencyVideoInput] = useState<AgencyROIInput>(
    DEFAULT_AGENCY_VIDEO_INPUT
  );
  const [agencyGeoInput, setAgencyGeoInput] = useState<AgencyGeoROIInput>(
    DEFAULT_AGENCY_GEO_INPUT
  );

  const brandResult = computeBrandROI(brandInput);
  const agencyVideoResult = computeAgencyROI(agencyVideoInput);
  const agencyGeoResult = computeAgencyGeoROI(agencyGeoInput);

  function handleReset() {
    if (mode === "brand") {
      setBrandInput(DEFAULT_BRAND_INPUT);
    } else if (agencyProductType === "Aive") {
      setAgencyVideoInput(DEFAULT_AGENCY_VIDEO_INPUT);
    } else {
      setAgencyGeoInput(DEFAULT_AGENCY_GEO_INPUT);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Outil 3 — ROI Calculator</CardTitle>
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
              onProductTypeChange={setAgencyProductType}
              videoInput={agencyVideoInput}
              onVideoChange={setAgencyVideoInput}
              geoInput={agencyGeoInput}
              onGeoChange={setAgencyGeoInput}
            />
          </TabsContent>
        </Tabs>

        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={handleReset}>
          Nouveau prospect
        </Button>

        {mode === "brand" ? (
          <RoiResults mode="brand" input={brandInput} result={brandResult} />
        ) : agencyProductType === "Aive" ? (
          <RoiResults mode="agency-video" input={agencyVideoInput} result={agencyVideoResult} />
        ) : (
          <RoiResults mode="agency-geo" input={agencyGeoInput} result={agencyGeoResult} />
        )}
      </CardContent>
    </Card>
  );
}
