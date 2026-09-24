"use client";

import {
  BookOpen,
  ChevronRight,
  Copy,
  Headphones,
  LayoutList,
  MessageSquareText,
  Phone,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  starred: boolean;
  usageCount: number;
  createdAt: string;
}

const CATEGORIES = ["All", "Sales", "Support", "Booking", "Survey", "General", "Custom"] as const;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Sales: Phone,
  Support: Headphones,
  Booking: LayoutList,
  Survey: MessageSquareText,
  General: BookOpen,
  Custom: Tag,
};

// ─── Seed prompts ─────────────────────────────────────────────────────────────

const SEED_PROMPTS: Prompt[] = [
  {
    id: "1",
    name: "Friendly Sales Opener",
    description: "Warm, non-pushy opening for sales calls",
    category: "Sales",
    tags: ["outbound", "warm", "opener"],
    starred: true,
    usageCount: 42,
    createdAt: "2026-08-12",
    content: `You are a friendly sales representative for Dracarys. Your goal is to build rapport with the prospect before discussing their needs.

Start by greeting the customer warmly and asking how their day is going. After a brief exchange, transition naturally into asking about their current challenges. Never mention pricing unless the customer asks. Focus on value and solving problems.

Tone: Warm, conversational, professional. Not pushy.`,
  },
  {
    id: "2",
    name: "Customer Support Specialist",
    description: "Empathetic support agent for resolving issues",
    category: "Support",
    tags: ["empathy", "resolution", "support"],
    starred: false,
    usageCount: 89,
    createdAt: "2026-08-15",
    content: `You are an empathetic customer support specialist for Dracarys. Your primary goal is to resolve customer issues quickly and leave them feeling heard and valued.

Begin every interaction by acknowledging the customer's frustration if any. Always apologise for inconvenience before diving into solutions. Offer step-by-step guidance. If you cannot resolve the issue, escalate politely.

Tone: Calm, empathetic, solution-focused.`,
  },
  {
    id: "3",
    name: "Appointment Booking Agent",
    description: "Efficiently books appointments and sends confirmations",
    category: "Booking",
    tags: ["appointment", "scheduling", "calendar"],
    starred: true,
    usageCount: 31,
    createdAt: "2026-08-20",
    content: `You are an appointment booking assistant for Dracarys. Your job is to help callers book, reschedule, or cancel appointments.

Always ask for: full name, preferred date/time (offer 3 options), contact number, and reason for visit. Confirm all details before ending the call. Mention that a confirmation will be sent to their email or phone.

Tone: Efficient, friendly, clear.`,
  },
  {
    id: "4",
    name: "Post-Call Survey",
    description: "Collects customer satisfaction feedback after calls",
    category: "Survey",
    tags: ["feedback", "NPS", "satisfaction"],
    starred: false,
    usageCount: 15,
    createdAt: "2026-09-01",
    content: `You are conducting a short post-call satisfaction survey on behalf of Dracarys. This will take less than 2 minutes.

Ask the following questions in order:
1. On a scale of 1-10, how satisfied were you with your experience today?
2. Was your issue fully resolved? (Yes/No)
3. Is there anything we could have done better?
4. Would you recommend us to a friend or colleague? (Yes/No)

Thank them warmly at the end and wish them a great day.

Tone: Polite, concise, appreciative.`,
  },
  {
    id: "5",
    name: "General Purpose Assistant",
    description: "Versatile assistant for mixed use-cases",
    category: "General",
    tags: ["general", "versatile", "flexible"],
    starred: false,
    usageCount: 7,
    createdAt: "2026-09-10",
    content: `You are a helpful AI assistant powered by Dracarys. You can assist with a wide range of tasks including answering questions, providing information, and helping users navigate to the right department.

Always be polite and professional. If you are unsure about something, say so honestly and offer to connect the user with a human agent.

Tone: Neutral, helpful, professional.`,
  },
];

// ─── Prompt card ─────────────────────────────────────────────────────────────

interface PromptCardProps {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

function PromptCard({ prompt, isSelected, onSelect, onToggleStar, onDelete, onCopy }: PromptCardProps) {
  const CategoryIcon = CATEGORY_ICONS[prompt.category] ?? BookOpen;

  return (
    <button
      onClick={onSelect}
      className={`group w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-cta/40 bg-cta/5"
          : "border-border/60 bg-muted/5 hover:border-border hover:bg-muted/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/40">
            <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{prompt.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{prompt.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(); }}
            className={`rounded p-0.5 transition-colors ${prompt.starred ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-400"}`}
            aria-label="Star prompt"
          >
            <Star className="h-3.5 w-3.5" fill={prompt.starred ? "currentColor" : "none"} />
          </button>
          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {prompt.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" />
          {prompt.usageCount} uses
        </div>
      </div>

      {/* Action buttons - visible on hover */}
      <div className="mt-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={e => { e.stopPropagation(); onCopy(); }}
          className="flex items-center gap-1 rounded-md border border-border/40 bg-background px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy className="h-2.5 w-2.5" />
          Copy
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="flex items-center gap-1 rounded-md border border-border/40 bg-background px-2 py-1 text-[10px] text-red-400/70 transition-colors hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
          Delete
        </button>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(SEED_PROMPTS);
  const [selectedId, setSelectedId] = useState<string | null>(SEED_PROMPTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ name: "", description: "", category: "General", content: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return prompts.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q));
      return matchCat && matchQ;
    });
  }, [prompts, selectedCategory, searchQuery]);

  const selectedPrompt = prompts.find(p => p.id === selectedId) ?? null;

  const handleCopy = useCallback((prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content).catch(() => {});
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleToggleStar = useCallback((id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  }, []);

  const handleCreate = useCallback(() => {
    if (!newPrompt.name.trim() || !newPrompt.content.trim()) return;
    const p: Prompt = {
      id: String(Date.now()),
      ...newPrompt,
      tags: [],
      starred: false,
      usageCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setPrompts(prev => [p, ...prev]);
    setSelectedId(p.id);
    setIsCreating(false);
    setNewPrompt({ name: "", description: "", category: "General", content: "" });
  }, [newPrompt]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/60 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prompt Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save and manage reusable system prompts for your voice agents
            </p>
          </div>
          <Button
            id="new-prompt-btn"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            New Prompt
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: list panel */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border/60">
          {/* Search */}
          <div className="border-b border-border/40 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="prompt-search"
                placeholder="Search prompts…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1 overflow-x-auto border-b border-border/40 p-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-cta/15 text-cta"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Prompt list */}
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No prompts found.{" "}
                <button onClick={() => setIsCreating(true)} className="underline hover:text-foreground">
                  Create one?
                </button>
              </p>
            ) : (
              filtered.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  isSelected={selectedId === prompt.id}
                  onSelect={() => { setSelectedId(prompt.id); setIsCreating(false); }}
                  onToggleStar={() => handleToggleStar(prompt.id)}
                  onDelete={() => handleDelete(prompt.id)}
                  onCopy={() => handleCopy(prompt)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: detail / create panel */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {isCreating ? (
            <div className="flex flex-col gap-4 p-6 max-w-2xl">
              <h2 className="text-lg font-semibold">Create New Prompt</h2>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name *</label>
                <Input
                  id="new-prompt-name"
                  placeholder="e.g. Friendly Sales Opener"
                  value={newPrompt.name}
                  onChange={e => setNewPrompt(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input
                  placeholder="Short description"
                  value={newPrompt.description}
                  onChange={e => setNewPrompt(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewPrompt(p => ({ ...p, category: cat }))}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                        newPrompt.category === cat
                          ? "border-cta/40 bg-cta/10 text-cta"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">System Prompt *</label>
                <Textarea
                  id="new-prompt-content"
                  placeholder="Write your system prompt here…"
                  rows={10}
                  value={newPrompt.content}
                  onChange={e => setNewPrompt(p => ({ ...p, content: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  id="save-prompt-btn"
                  onClick={handleCreate}
                  disabled={!newPrompt.name.trim() || !newPrompt.content.trim()}
                >
                  Save Prompt
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : selectedPrompt ? (
            <div className="flex flex-col gap-5 p-6 max-w-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedPrompt.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedPrompt.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    id="copy-prompt-btn"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleCopy(selectedPrompt)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedId === selectedPrompt.id ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-red-400 hover:text-red-400"
                    onClick={() => handleDelete(selectedPrompt.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {selectedPrompt.category}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {selectedPrompt.usageCount} uses
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  Created {selectedPrompt.createdAt}
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap">
                {selectedPrompt.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Prompt content */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  System Prompt
                </label>
                <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                    {selectedPrompt.content}
                  </pre>
                </div>
              </div>

              {/* Apply to agent CTA */}
              <div className="rounded-xl border border-border/40 bg-muted/5 p-4">
                <p className="text-sm font-medium">Apply this prompt to an agent</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Go to Voice Agents, select an agent, and paste this prompt as the system prompt in the configuration.
                </p>
                <Link
                  href="/workflow"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-cta hover:underline"
                >
                  Open Voice Agents <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <h2 className="text-base font-semibold">Select a prompt to view details</h2>
              <p className="text-sm text-muted-foreground">
                Or{" "}
                <button onClick={() => setIsCreating(true)} className="text-cta underline">
                  create a new one
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
