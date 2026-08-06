import { RoiCalculatorTool } from "@/components/roi-calculator-tool";
import { PaulHeader } from "@/components/paul-header";

export default function ClosingPage() {
  return (
    <div className="aive-page-bg flex min-h-screen flex-col items-center gap-8 px-4 py-16">
      <PaulHeader active="/closing" />
      <RoiCalculatorTool />
    </div>
  );
}
