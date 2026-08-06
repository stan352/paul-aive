"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgencyGeoROIInput, AgencyProductType, AgencyROIInput } from "@/lib/roi-calculator";

const AGENCY_PRODUCT_TYPES: AgencyProductType[] = ["Aive", "Aive GEO"];

function numberFromEvent(value: string): number {
  return value === "" ? 0 : Number(value);
}

export function AgencyForm({
  productType,
  onProductTypeChange,
  videoInput,
  onVideoChange,
  geoInput,
  onGeoChange,
}: {
  productType: AgencyProductType;
  onProductTypeChange: (productType: AgencyProductType) => void;
  videoInput: AgencyROIInput;
  onVideoChange: (input: AgencyROIInput) => void;
  geoInput: AgencyGeoROIInput;
  onGeoChange: (input: AgencyGeoROIInput) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="agency-product-type">Offre</Label>
        <Select
          value={productType}
          onValueChange={(value) => onProductTypeChange(value as AgencyProductType)}
        >
          <SelectTrigger id="agency-product-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENCY_PRODUCT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productType === "Aive" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="internal-time">Temps de production interne par déclinaison (h)</Label>
            <Input
              id="internal-time"
              type="number"
              min={0}
              step={0.1}
              value={videoInput.internalTimePerDeclinaison}
              onChange={(event) =>
                onVideoChange({
                  ...videoInput,
                  internalTimePerDeclinaison: numberFromEvent(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="team-hourly-rate">Taux horaire moyen équipe créa/prod (€)</Label>
            <Input
              id="team-hourly-rate"
              type="number"
              min={0}
              value={videoInput.teamHourlyRate}
              onChange={(event) =>
                onVideoChange({ ...videoInput, teamHourlyRate: numberFromEvent(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="annual-volume">Volume annuel de déclinaisons produites</Label>
            <Input
              id="annual-volume"
              type="number"
              min={0}
              value={videoInput.annualVolume}
              onChange={(event) =>
                onVideoChange({ ...videoInput, annualVolume: numberFromEvent(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="proposed-aive-cost-agency">Coût annuel Aive proposé (€)</Label>
            <Input
              id="proposed-aive-cost-agency"
              type="number"
              min={0}
              value={videoInput.proposedAiveAnnualCost}
              onChange={(event) =>
                onVideoChange({
                  ...videoInput,
                  proposedAiveAnnualCost: numberFromEvent(event.target.value),
                })
              }
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="internal-time-article">Temps interne par rédaction d&apos;article GEO (h)</Label>
            <Input
              id="internal-time-article"
              type="number"
              min={0}
              step={0.1}
              value={geoInput.internalTimePerArticle}
              onChange={(event) =>
                onGeoChange({
                  ...geoInput,
                  internalTimePerArticle: numberFromEvent(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="internal-time-audit">Temps interne par audit GEO (h)</Label>
            <Input
              id="internal-time-audit"
              type="number"
              min={0}
              step={0.1}
              value={geoInput.internalTimePerAudit}
              onChange={(event) =>
                onGeoChange({
                  ...geoInput,
                  internalTimePerAudit: numberFromEvent(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="team-hourly-rate-geo">Taux horaire moyen équipe SEO/contenu (€)</Label>
            <Input
              id="team-hourly-rate-geo"
              type="number"
              min={0}
              value={geoInput.teamHourlyRate}
              onChange={(event) =>
                onGeoChange({ ...geoInput, teamHourlyRate: numberFromEvent(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="annual-article-volume">Volume annuel d&apos;articles GEO produits</Label>
            <Input
              id="annual-article-volume"
              type="number"
              min={0}
              value={geoInput.annualArticleVolume}
              onChange={(event) =>
                onGeoChange({
                  ...geoInput,
                  annualArticleVolume: numberFromEvent(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="annual-audit-volume">Volume annuel d&apos;audits GEO réalisés</Label>
            <Input
              id="annual-audit-volume"
              type="number"
              min={0}
              value={geoInput.annualAuditVolume}
              onChange={(event) =>
                onGeoChange({
                  ...geoInput,
                  annualAuditVolume: numberFromEvent(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="proposed-aive-geo-cost-agency">Coût annuel Aive GEO proposé (€)</Label>
            <Input
              id="proposed-aive-geo-cost-agency"
              type="number"
              min={0}
              value={geoInput.proposedAiveAnnualCost}
              onChange={(event) =>
                onGeoChange({
                  ...geoInput,
                  proposedAiveAnnualCost: numberFromEvent(event.target.value),
                })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
