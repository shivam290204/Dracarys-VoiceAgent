"use client";

import { Settings2 } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from "react";

import { WorkflowTesterPanel } from "@/app/workflow/[workflowId]/components/WorkflowTesterPanel";
import { getWorkflowsApiV1WorkflowFetchGet } from "@/client/sdk.gen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Workflow {
  id: number;
  name: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveChatPage() {
  const [agents, setAgents] = useState<Workflow[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // Fetch agents
  useEffect(() => {
    getWorkflowsApiV1WorkflowFetchGet({ query: { status: 'active' } })
      .then(res => {
        const items = (Array.isArray(res.data) ? res.data : []) as Workflow[];
        setAgents(items);
        if (items.length > 0) setSelectedAgentId(String(items[0].id));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      {/* Page Header */}
      <div className="border-b border-border/60 px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Live Voice Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time voice conversation with your AI agents over WebRTC
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-6 p-6">
        {/* Agent selector */}
        <div className="w-full max-w-xl">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Select Agent
          </label>
          <Select
            value={selectedAgentId}
            onValueChange={setSelectedAgentId}
          >
            <SelectTrigger id="agent-select" className="w-full">
              <SelectValue placeholder="Choose an agent…" />
            </SelectTrigger>
            <SelectContent>
              {agents.length === 0 && (
                <SelectItem value="__none__" disabled>No agents found</SelectItem>
              )}
              {agents.map(a => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Call card */}
        <div className="w-full max-w-4xl h-[600px] overflow-hidden rounded-2xl border border-border/60 bg-muted/10 shadow-2xl backdrop-blur-md">
          {selectedAgentId && selectedAgentId !== "__none__" ? (
            <WorkflowTesterPanel
              workflowId={parseInt(selectedAgentId, 10)}
              disabled={false}
              disabledReason={null}
              isVisible={true}
              className="h-full border-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
              Please select an agent to start a live voice chat.
            </div>
          )}
        </div>

        {/* Settings hint */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <Settings2 className="h-3.5 w-3.5" />
          Configure agents at{" "}
          <Link href="/workflow" className="underline hover:text-foreground">
            Voice Agents
          </Link>{" "}
          and telephony at{" "}
          <Link href="/telephony-configurations" className="underline hover:text-foreground">
            Telephony
          </Link>
        </div>
      </div>
    </div>
  );
}
