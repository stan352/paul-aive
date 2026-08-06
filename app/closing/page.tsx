import Link from "next/link";
import { RoiCalculatorTool } from "@/components/roi-calculator-tool";

export default function ClosingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 py-16 dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight">Paul</h1>
      <RoiCalculatorTool />
      <Link href="/pitch" className="text-sm text-muted-foreground underline">
        ← Outil 2 — Pitch
      </Link>
    </div>
  );
}
