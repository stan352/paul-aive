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
import {
  buildDiscoveryPrompt,
  CLIENT_SEGMENTS,
  TARGET_SOLUTIONS,
  type ClientSegment,
  type TargetSolution,
} from "@/lib/prompt-templates";

type GenerationState =
  | { status: "idle" }
  | { status: "done"; prompt: string; copied: boolean };

export function DiscoveryForm() {
  const [personaRole, setPersonaRole] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [targetSolution, setTargetSolution] = useState<TargetSolution>(
    TARGET_SOLUTIONS[0]
  );
  const [clientSegment, setClientSegment] = useState<ClientSegment>(
    CLIENT_SEGMENTS[0]
  );
  const [state, setState] = useState<GenerationState>({ status: "idle" });

  const canSubmit = personaRole.trim().length > 0;

  function handleReset() {
    setPersonaRole("");
    setClientUrl("");
    setTargetSolution(TARGET_SOLUTIONS[0]);
    setClientSegment(CLIENT_SEGMENTS[0]);
    setState({ status: "idle" });
  }

  function handleGenerate() {
    const prompt = buildDiscoveryPrompt({
      personaRole,
      targetSolution,
      clientSegment,
      clientUrl,
    });

    openClaudeDesignWithPrompt(prompt, (copied) => {
      setState({ status: "done", prompt, copied });
    });

    setState({ status: "done", prompt, copied: false });
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Outil 1 — Script Generator &amp; Discovery Playbook</CardTitle>
        <CardDescription>
          Clique sur « Générer » : un onglet Claude Design s&apos;ouvre et le prompt est
          copié dans ton presse-papier — colle-le (Cmd+V) pour obtenir ta fiche de
          découverte.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="persona-role">Poste de l&apos;interlocuteur</Label>
          <Input
            id="persona-role"
            placeholder="ex. Social Media Lead, Brand Director…"
            value={personaRole}
            onChange={(event) => setPersonaRole(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="client-url">Site du prospect (optionnel)</Label>
          <Input
            id="client-url"
            placeholder="ex. https://www.peugeot.fr/"
            value={clientUrl}
            onChange={(event) => setClientUrl(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="target-solution">Solution ciblée</Label>
          <Select
            value={targetSolution}
            onValueChange={(value) => setTargetSolution(value as TargetSolution)}
          >
            <SelectTrigger id="target-solution" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_SOLUTIONS.map((solution) => (
                <SelectItem key={solution} value={solution}>
                  {solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
