import * as XLSX from "xlsx";
import type {
  AgencyROIInput,
  AgencyROIResult,
  BrandROIInput,
  BrandROIResult,
} from "@/lib/roi-calculator";

type ExportPayload =
  | { mode: "brand"; input: BrandROIInput; result: BrandROIResult }
  | { mode: "agency"; input: AgencyROIInput; result: AgencyROIResult };

function brandInputRows(input: BrandROIInput): (string | number)[][] {
  return [
    ["Type d'agence remplacée", input.agencyType],
    ["Volume annuel de vidéos/déclinaisons", input.annualVideoVolume],
    ["Coût agence de référence (€)", input.agencyCost],
    ["Coût annuel Aive proposé (€)", input.proposedAiveAnnualCost],
  ];
}

function brandResultRows(result: BrandROIResult): (string | number)[][] {
  return [
    ["Coût agence annuel (€)", result.agencyAnnualCost],
    ["Économie nette annuelle (€)", result.netAnnualSaving],
    ["ROI (%)", result.roiPercent ?? "—"],
    ["Délai de rentabilité (mois)", result.paybackMonths ?? "—"],
  ];
}

function agencyInputRows(input: AgencyROIInput): (string | number)[][] {
  return [
    ["Temps de production interne par déclinaison (h)", input.internalTimePerDeclinaison],
    ["Taux horaire moyen équipe créa/prod (€)", input.teamHourlyRate],
    ["Volume annuel de déclinaisons", input.annualVolume],
    ["Coût annuel Aive proposé (€)", input.proposedAiveAnnualCost],
  ];
}

function agencyResultRows(result: AgencyROIResult): (string | number)[][] {
  return [
    ["Coût de production actuel par déclinaison (€)", result.currentCostPerDeclinaison],
    ["Coût de production avec Aive par déclinaison (€)", result.aiveCostPerDeclinaison],
    ["Économie de production annuelle (€)", result.annualProductionSaving],
    ["ROI agence (%)", result.roiPercent ?? "—"],
    ["Délai de rentabilité (mois)", result.paybackMonths ?? "—"],
  ];
}

// Largeurs de colonnes en "nombre de caractères" (unité attendue par SheetJS) —
// sans ça, Excel/Numbers ouvrent le fichier avec des colonnes par défaut trop
// étroites qui tronquent les libellés.
const COLUMN_WIDTHS = [{ wch: 55 }, { wch: 18 }];

export function exportRoiTable(payload: ExportPayload): void {
  const inputRows =
    payload.mode === "brand" ? brandInputRows(payload.input) : agencyInputRows(payload.input);
  const resultRows =
    payload.mode === "brand" ? brandResultRows(payload.result) : agencyResultRows(payload.result);

  const workbook = XLSX.utils.book_new();
  const inputSheet = XLSX.utils.aoa_to_sheet([["Champ", "Valeur"], ...inputRows]);
  const resultSheet = XLSX.utils.aoa_to_sheet([["Indicateur", "Valeur"], ...resultRows]);
  inputSheet["!cols"] = COLUMN_WIDTHS;
  resultSheet["!cols"] = COLUMN_WIDTHS;

  XLSX.utils.book_append_sheet(workbook, inputSheet, "Données d'entrée");
  XLSX.utils.book_append_sheet(workbook, resultSheet, "Résultats");

  const modeLabel = payload.mode === "brand" ? "Marque" : "Agence";
  XLSX.writeFile(workbook, `ROI-Aive-${modeLabel}.xlsx`);
}
