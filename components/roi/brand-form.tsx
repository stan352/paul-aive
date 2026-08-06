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
import {
  AGENCY_COST_DEFAULTS,
  AIVE_ANNUAL_COST_DEFAULTS,
  type AgencyType,
  type BrandROIInput,
} from "@/lib/roi-calculator";

const AGENCY_TYPES: AgencyType[] = ["CREA", "GEO"];

function numberFromEvent(value: string): number {
  return value === "" ? 0 : Number(value);
}

export function BrandForm({
  input,
  onChange,
}: {
  input: BrandROIInput;
  onChange: (input: BrandROIInput) => void;
}) {
  function handleAgencyTypeChange(agencyType: AgencyType) {
    onChange({
      ...input,
      agencyType,
      agencyCost: AGENCY_COST_DEFAULTS[agencyType],
      proposedAiveAnnualCost:
        agencyType === "CREA"
          ? AIVE_ANNUAL_COST_DEFAULTS.videoGeneration
          : AIVE_ANNUAL_COST_DEFAULTS.geo,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="agency-type">Type d&apos;agence remplacée</Label>
        <Select
          value={input.agencyType}
          onValueChange={(value) => handleAgencyTypeChange(value as AgencyType)}
        >
          <SelectTrigger id="agency-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENCY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "CREA" ? "Agence créative (CREA)" : "Agence GEO (audits & articles)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="annual-video-volume">
          Volume annuel de vidéos/déclinaisons produites
        </Label>
        <Input
          id="annual-video-volume"
          type="number"
          min={0}
          value={input.annualVideoVolume}
          onChange={(event) =>
            onChange({ ...input, annualVideoVolume: numberFromEvent(event.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="agency-cost">
          {input.agencyType === "CREA"
            ? "Coût agence par déclinaison (€)"
            : "Coût agence mensuel (€)"}
        </Label>
        <Input
          id="agency-cost"
          type="number"
          min={0}
          value={input.agencyCost}
          onChange={(event) =>
            onChange({ ...input, agencyCost: numberFromEvent(event.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="proposed-aive-cost">Coût annuel Aive proposé (€)</Label>
        <Input
          id="proposed-aive-cost"
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
