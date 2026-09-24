"use client";

import {
  Bot,
  CornerDownLeft,
  Download,
  Plus,
  Settings2,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getWorkflowsApiV1WorkflowFetchGet } from "@/client/sdk.gen";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Workflow {
  id: number;
  name: string;
  description?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  createdAt: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Simulated AI response (replace with real API call) ─────────────────────

async function simulateAgentResponse(userMessage: string, agentName: string): Promise<string> {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
  const responses = [
    `I understand you said: "${userMessage}". As ${agentName}, I'm here to assist you with any questions or tasks.`,
    `Great question! Let me help you with that. ${userMessage.length > 20 ? "I've analysed your message carefully." : ""} Here's what I can tell you…`,
    `Thanks for reaching out! I'm ${agentName}. I'd be happy to help you with "${userMessage}". Could you share more details?`,
    `Absolutely! Here's a thorough answer to your question about "${userMessage.split(" ").slice(0, 5).join(" ")}…"`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-cta/20 text-cta" : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[75%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-cta/15 text-foreground"
              : "rounded-tl-sm bg-muted/30 text-foreground"
          }`}
        >
          {msg.content}
        </div>
        <span className="px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIChatPage() {
  const [agents, setAgents] = useState<Workflow[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, isTyping]);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;
  const selectedAgent = agents.find(a => String(a.id) === selectedAgentId);

  // New conversation
  const handleNewChat = useCallback(() => {
    if (!selectedAgentId || !selectedAgent) return;
    const conv: Conversation = {
      id: generateId(),
      agentId: selectedAgentId,
      agentName: selectedAgent.name,
      messages: [
        {
          id: generateId(),
          role: "assistant",
          content: `Hello! I'm ${selectedAgent.name}. How can I assist you today?`,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
  }, [selectedAgentId, selectedAgent]);

  // Send message
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeConvId || isTyping) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setInputText("");
    setIsTyping(true);
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, userMsg] }
          : c
      )
    );

    try {
      const agentName = conversations.find(c => c.id === activeConvId)?.agentName ?? "Agent";
      const reply = await simulateAgentResponse(text, agentName);
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [inputText, activeConvId, isTyping, conversations]);

  // Keyboard shortcut
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  // Export conversation
  const handleExport = useCallback(() => {
    if (!activeConv) return;
    const lines = activeConv.messages.map(
      m => `[${formatTime(m.timestamp)}] ${m.role === "user" ? "You" : activeConv.agentName}: ${m.content}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `conversation-${activeConv.id}.txt`;
    a.click();
  }, [activeConv]);

  // Delete conversation
  const handleDelete = useCallback(
    (convId: string) => {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) setActiveConvId(null);
    },
    [activeConvId]
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Page Header */}
      <div className="border-b border-border/60 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Text conversations with your Dracarys voice agents
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — conversation list */}
        <div className="flex w-64 shrink-0 flex-col border-r border-border/60 bg-muted/5">
          {/* Agent selector + new chat */}
          <div className="space-y-2 border-b border-border/40 p-3">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger id="chat-agent-select" className="w-full text-xs">
                <SelectValue placeholder="Select agent…" />
              </SelectTrigger>
              <SelectContent>
                {agents.length === 0 && (
                  <SelectItem value="__none__" disabled>No agents found</SelectItem>
                )}
                {agents.map(a => (
                  <SelectItem key={a.id} value={String(a.id)} className="text-xs">
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              id="new-chat-btn"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={handleNewChat}
              disabled={!selectedAgentId || selectedAgentId === "__none__"}
            >
              <Plus className="h-3.5 w-3.5" />
              New Conversation
            </Button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No conversations yet. Select an agent and start chatting.
              </p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group flex w-full items-start justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    activeConvId === conv.id
                      ? "bg-cta/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{conv.agentName}</p>
                    <p className="truncate text-[10px] opacity-70">
                      {conv.messages.at(-1)?.content.slice(0, 40)}…
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(conv.id); }}
                    className="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Start a Conversation</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select an agent from the sidebar and click "New Conversation"
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5" />
                Build agents at{" "}
                <a href="/workflow" className="underline hover:text-foreground">
                  Voice Agents
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold">{activeConv.agentName}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Online
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleExport}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {activeConv.messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted/30 px-4 py-3">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border/40 p-4">
                <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/10 px-3 py-2 focus-within:border-cta/40 transition-colors">
                  <Textarea
                    ref={textareaRef}
                    id="chat-input"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="max-h-32 min-h-[36px] flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                  <Button
                    id="send-btn"
                    size="icon"
                    disabled={!inputText.trim() || isTyping}
                    onClick={() => void handleSend()}
                    className="h-8 w-8 shrink-0 rounded-lg"
                  >
                    <CornerDownLeft className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  AI responses are simulated. Connect your backend to enable real agent responses.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
