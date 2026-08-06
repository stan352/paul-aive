import Link from "next/link";
import { OpportunityForm } from "@/components/opportunity-form";

export default function PitchPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 py-16 dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight">Paul</h1>
      <OpportunityForm />
      <div className="flex gap-4">
        <Link href="/" className="text-sm text-muted-foreground underline">
          ← Outil 1 — Découverte
        </Link>
        <Link href="/closing" className="text-sm text-muted-foreground underline">
          Outil 3 — Closing →
        </Link>
      </div>
    </div>
  );
}
