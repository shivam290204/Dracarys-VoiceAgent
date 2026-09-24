"use client";

import { Mic, MicOff, Phone, PhoneOff, Settings2, Volume2, VolumeX } from "lucide-react";
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

// ─── Types ───────────────────────────────────────────────────────────────────

type CallState = "idle" | "connecting" | "active" | "ended";

interface Workflow {
  id: number;
  name: string;
}

interface TranscriptLine {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// ─── Waveform Canvas ─────────────────────────────────────────────────────────

function WaveformVisualizer({
  isActive,
  isMuted,
}: {
  isActive: boolean;
  isMuted: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive || isMuted) {
      cancelAnimationFrame(animRef.current);
      drawFlatLine();
      return;
    }

    let mounted = true;

    async function startAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        audioCtxRef.current = new AudioContext();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        audioCtxRef.current
          .createMediaStreamSource(stream)
          .connect(analyserRef.current);
        draw();
      } catch {
        // Mic not available – show animated pulse instead
        drawPulse();
      }
    }

    function draw() {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d")!;
      const data = new Uint8Array(analyser.frequencyBinCount);

      function render() {
        if (!mounted) return;
        analyser!.getByteTimeDomainData(data);
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(240,170,70,0.9)";
        ctx.shadowColor = "rgba(240,170,70,0.5)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const sliceW = canvas!.width / data.length;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * canvas!.height) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          x += sliceW;
        }
        ctx.lineTo(canvas!.width, canvas!.height / 2);
        ctx.stroke();
        animRef.current = requestAnimationFrame(render);
      }
      render();
    }

    function drawPulse() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      let t = 0;
      function render() {
        if (!mounted) return;
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(240,170,70,0.9)";
        ctx.shadowColor = "rgba(240,170,70,0.5)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < canvas!.width; x++) {
          const freq = 0.05;
          const amp = 20 + 10 * Math.sin(t * 0.02);
          const y = canvas!.height / 2 + amp * Math.sin(x * freq + t * 0.08);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        t++;
        animRef.current = requestAnimationFrame(render);
      }
      render();
    }

    startAudio();

    return () => {
      mounted = false;
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
    };
  }, [isActive, isMuted]);

  function drawFlatLine() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full rounded-xl"
      style={{ background: "transparent" }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveChatPage() {
  const [agents, setAgents] = useState<Workflow[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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

  // Timer
  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callState === "idle") setElapsedSec(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleStartCall = useCallback(() => {
    setCallState("connecting");
    // Simulate connection — replace with real WebRTC connection to the selected agent
    setTimeout(() => {
      setCallState("active");
      setTranscript([
        {
          id: "1",
          role: "assistant",
          text: "Hello! I'm your Dracarys AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  }, []);

  const handleEndCall = useCallback(() => {
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 2000);
  }, []);

  // Simulate assistant responses for demo
  useEffect(() => {
    if (callState !== "active") return;
    const timer = setTimeout(() => {
      setTranscript(prev => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          text: "I'm listening and ready to help with any questions you have.",
          timestamp: new Date(),
        },
      ]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [callState]);

  const selectedAgent = agents.find(a => String(a.id) === selectedAgentId);

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
            disabled={callState !== "idle"}
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
        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-muted/10 shadow-2xl backdrop-blur-md">
          {/* Status bar */}
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full transition-all ${
                  callState === "active"
                    ? "animate-pulse bg-emerald-500"
                    : callState === "connecting"
                    ? "animate-pulse bg-amber-500"
                    : callState === "ended"
                    ? "bg-red-500"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-sm font-medium capitalize">
                {callState === "idle" ? "Ready" : callState}
              </span>
            </div>
            {callState === "active" && (
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {formatTime(elapsedSec)}
              </span>
            )}
            {selectedAgent && (
              <span className="text-xs text-muted-foreground">{selectedAgent.name}</span>
            )}
          </div>

          {/* Waveform */}
          <div className="px-5 py-6">
            <WaveformVisualizer isActive={callState === "active"} isMuted={isMuted} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 border-t border-border/40 px-5 py-5">
            {/* Mute */}
            <Button
              variant="outline"
              size="icon"
              id="mute-btn"
              onClick={() => setIsMuted(m => !m)}
              disabled={callState !== "active"}
              className={`h-12 w-12 rounded-full transition-all ${
                isMuted ? "border-red-500/60 bg-red-500/10 text-red-400" : ""
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Main call button */}
            {callState === "idle" || callState === "ended" ? (
              <Button
                id="start-call-btn"
                size="icon"
                onClick={handleStartCall}
                disabled={!selectedAgentId || selectedAgentId === "__none__"}
                className="h-16 w-16 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-500 hover:shadow-emerald-700/50 active:scale-95"
              >
                <Phone className="h-7 w-7" />
              </Button>
            ) : callState === "connecting" ? (
              <Button
                id="connecting-btn"
                size="icon"
                disabled
                className="h-16 w-16 animate-pulse rounded-full bg-amber-600 text-white"
              >
                <Phone className="h-7 w-7" />
              </Button>
            ) : (
              <Button
                id="end-call-btn"
                size="icon"
                onClick={handleEndCall}
                className="h-16 w-16 rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 active:scale-95"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            )}

            {/* Speaker */}
            <Button
              variant="outline"
              size="icon"
              id="speaker-btn"
              onClick={() => setIsSpeakerOff(s => !s)}
              disabled={callState !== "active"}
              className={`h-12 w-12 rounded-full transition-all ${
                isSpeakerOff ? "border-red-500/60 bg-red-500/10 text-red-400" : ""
              }`}
            >
              {isSpeakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>

          {callState === "idle" && (
            <p className="pb-4 text-center text-xs text-muted-foreground">
              Select an agent above and press the call button to start
            </p>
          )}
        </div>

        {/* Live Transcript */}
        {transcript.length > 0 && (
          <div className="w-full max-w-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Live Transcript
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setTranscript([])}
              >
                Clear
              </Button>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-border/40 bg-muted/5 p-4">
              {transcript.map(line => (
                <div
                  key={line.id}
                  className={`flex gap-2 ${line.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      line.role === "user"
                        ? "bg-cta/15 text-foreground"
                        : "bg-muted/40 text-foreground"
                    }`}
                  >
                    <p>{line.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {line.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Settings hint */}
        {callState === "idle" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" />
            Configure agents at{" "}
            <a href="/workflow" className="underline hover:text-foreground">
              Voice Agents
            </a>{" "}
            and telephony at{" "}
            <a href="/telephony-configurations" className="underline hover:text-foreground">
              Telephony
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
