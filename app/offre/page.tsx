import { OfferSimulatorTool } from "@/components/offer-simulator-tool";
import { PaulHeader } from "@/components/paul-header";

export default function OffrePage() {
  return (
    <div className="aive-page-bg flex min-h-screen flex-col items-center gap-8 px-4 py-16">
      <PaulHeader active="/offre" />
      <OfferSimulatorTool />
    </div>
  );
}
