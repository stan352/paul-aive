"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GeneratedPromptResult } from "@/components/generated-prompt-result";
import { openClaudeDesignWithPrompt } from "@/lib/claude-design";
import { GP_DEFAULT_SEGMENT, GP_PROFILES, type GpProfile } from "@/lib/gp-mapping";
import {
  buildOpportunityPrompt,
  CLIENT_SEGMENTS,
  type ClientSegment,
} from "@/lib/prompt-templates";

type GenerationState =
  | { status: "idle" }
  | { status: "done"; prompt: string; copied: boolean };

export function OpportunityForm() {
  const [gpProfile, setGpProfile] = useState<GpProfile>(GP_PROFILES[0]);
  const [clientUrl, setClientUrl] = useState("");
  const [clientSegment, setClientSegment] = useState<ClientSegment>(
    GP_DEFAULT_SEGMENT[GP_PROFILES[0]]
  );
  const [state, setState] = useState<GenerationState>({ status: "idle" });

  const canSubmit = clientUrl.trim().length > 0;

  function handleGpChange(value: GpProfile) {
    setGpProfile(value);
    setClientSegment(GP_DEFAULT_SEGMENT[value]);
  }

  function handleReset() {
    setClientUrl("");
    setClientSegment(GP_DEFAULT_SEGMENT[gpProfile]);
    setState({ status: "idle" });
  }

  function handleGenerate() {
    const prompt = buildOpportunityPrompt({ gpProfile, clientUrl, clientSegment });

    openClaudeDesignWithPrompt(prompt, (copied) => {
      setState({ status: "done", prompt, copied });
    });

    setState({ status: "done", prompt, copied: false });
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Outil 2 — Opportunity Finder &amp; Pitch Angle</CardTitle>
        <CardDescription>
          À utiliser après la découverte, pour identifier les opportunités du prospect
          et construire ton angle de pitch. Clique sur « Générer » : un onglet Claude
          Design s&apos;ouvre et le prompt est copié dans ton presse-papier — colle-le
          (Cmd+V). Claude recherche lui-même les opportunités du prospect en ligne pour
          construire ton pitch client.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="gp-profile">Growth Partner</Label>
          <Select value={gpProfile} onValueChange={(value) => handleGpChange(value as GpProfile)}>
            <SelectTrigger id="gp-profile" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GP_PROFILES.map((gp) => (
                <SelectItem key={gp} value={gp}>
                  {gp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="client-url">URL du prospect</Label>
          <Input
            id="client-url"
            placeholder="https://www.peugeot.fr/"
            value={clientUrl}
            onChange={(event) => setClientUrl(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="client-segment">Segment client</Label>
          <Select
            value={clientSegment}
            onValueChange={(value) => setClientSegment(value as ClientSegment)}
          >
            <SelectTrigger id="client-segment" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_SEGMENTS.map((segment) => (
                <SelectItem key={segment} value={segment}>
                  {segment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="bg-gradient-aive text-white hover:opacity-90 disabled:opacity-50"
          >
            Générer
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Nouveau prospect
          </Button>
        </div>

        {state.status === "done" && (
          <GeneratedPromptResult prompt={state.prompt} initiallyCopied={state.copied} />
        )}
      </CardContent>
    </Card>
  );
}
