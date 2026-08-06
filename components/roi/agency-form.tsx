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
import type { AgencyProductType, AgencyROIInput } from "@/lib/roi-calculator";

const AGENCY_PRODUCT_TYPES: AgencyProductType[] = ["Aive", "Aive GEO"];

function numberFromEvent(value: string): number {
  return value === "" ? 0 : Number(value);
}

export function AgencyForm({
  productType,
  onProductTypeChange,
  input,
  onChange,
}: {
  productType: AgencyProductType;
  onProductTypeChange: (productType: AgencyProductType) => void;
  input: AgencyROIInput;
  onChange: (input: AgencyROIInput) => void;
}) {
  const isGeo = productType === "Aive GEO";

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

      <div className="flex flex-col gap-2">
        <Label htmlFor="internal-time">
          {isGeo
            ? "Temps interne moyen par livrable GEO (audit ou article) (h)"
            : "Temps de production interne par déclinaison (h)"}
        </Label>
        <Input
          id="internal-time"
          type="number"
          min={0}
          step={0.1}
          value={input.internalTimePerDeclinaison}
          onChange={(event) =>
            onChange({
              ...input,
              internalTimePerDeclinaison: numberFromEvent(event.target.value),
            })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="team-hourly-rate">
          {isGeo
            ? "Taux horaire moyen équipe SEO/contenu (€)"
            : "Taux horaire moyen équipe créa/prod (€)"}
        </Label>
        <Input
          id="team-hourly-rate"
          type="number"
          min={0}
          value={input.teamHourlyRate}
          onChange={(event) =>
            onChange({ ...input, teamHourlyRate: numberFromEvent(event.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="annual-volume">
          {isGeo
            ? "Volume annuel de livrables GEO (audits + articles)"
            : "Volume annuel de déclinaisons produites"}
        </Label>
        <Input
          id="annual-volume"
          type="number"
          min={0}
          value={input.annualVolume}
          onChange={(event) =>
            onChange({ ...input, annualVolume: numberFromEvent(event.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="proposed-aive-cost-agency">
          {isGeo ? "Coût annuel Aive GEO proposé (€)" : "Coût annuel Aive proposé (€)"}
        </Label>
        <Input
          id="proposed-aive-cost-agency"
          type="number"
          min={0}
          value={input.proposedAiveAnnualCost}
          onChange={(event) =>
            onChange({
              ...input,
              proposedAiveAnnualCost: numberFromEvent(event.target.value),
            })
          }
        />
      </div>
    </div>
  );
}
