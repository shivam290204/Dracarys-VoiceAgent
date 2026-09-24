"use client";

import React from "react";
import {
  Activity,
  BarChart2,
  Clock,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Seed data (replace with real API) ───────────────────────────────────────

const callVolumeData = [
  { day: "Mon", calls: 34, duration: 142 },
  { day: "Tue", calls: 52, duration: 198 },
  { day: "Wed", calls: 48, duration: 175 },
  { day: "Thu", calls: 61, duration: 230 },
  { day: "Fri", calls: 70, duration: 261 },
  { day: "Sat", calls: 29, duration: 98 },
  { day: "Sun", calls: 18, duration: 65 },
];

const agentPerformanceData = [
  { name: "Sales Bot", calls: 102, success: 88, failed: 14 },
  { name: "Support", calls: 87, success: 74, failed: 13 },
  { name: "Booking", calls: 64, success: 58, failed: 6 },
  { name: "Outbound", calls: 41, success: 30, failed: 11 },
  { name: "Survey", calls: 18, success: 15, failed: 3 },
];

const recentCalls = [
  { id: "#8421", agent: "Sales Bot", duration: "3:42", status: "completed", direction: "inbound", time: "2 min ago" },
  { id: "#8420", agent: "Support", duration: "1:15", status: "completed", direction: "outbound", time: "8 min ago" },
  { id: "#8419", agent: "Booking", duration: "0:00", status: "failed", direction: "inbound", time: "12 min ago" },
  { id: "#8418", agent: "Sales Bot", duration: "5:01", status: "completed", direction: "inbound", time: "25 min ago" },
  { id: "#8417", agent: "Outbound", duration: "2:33", status: "completed", direction: "outbound", time: "34 min ago" },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

function StatCard({ title, value, change, positive, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/5 p-5 transition-all hover:bg-muted/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className={`mt-3 flex items-center gap-1 text-xs ${positive ? "text-emerald-500" : "text-red-400"}`}>
        {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        <span>{change} vs last week</span>
      </div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/60 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of your agent performance and call activity
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/10 px-3 py-1.5 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Last 7 days
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Total Calls" value="312" change="+18%" positive icon={Phone} />
          <StatCard title="Avg Duration" value="3m 12s" change="+5%" positive icon={Clock} />
          <StatCard title="Success Rate" value="82.4%" change="-2.1%" positive={false} icon={BarChart2} />
          <StatCard title="Unique Callers" value="189" change="+24%" positive icon={Users} />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Call volume */}
          <div className="rounded-xl border border-border/60 bg-muted/5 p-5">
            <h2 className="mb-4 text-sm font-semibold">Call Volume (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={callVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#f0aa46"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#f0aa46", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Calls"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Agent performance */}
          <div className="rounded-xl border border-border/60 bg-muted/5 p-5">
            <h2 className="mb-4 text-sm font-semibold">Agent Performance</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agentPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="success" fill="#10b981" radius={[0, 4, 4, 0]} name="Success" stackId="a" />
                <Bar dataKey="failed" fill="#ef4444" radius={[0, 4, 4, 0]} name="Failed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent calls table */}
        <div className="rounded-xl border border-border/60 bg-muted/5">
          <div className="border-b border-border/40 px-5 py-4">
            <h2 className="text-sm font-semibold">Recent Calls</h2>
          </div>
          <div className="divide-y divide-border/30">
            {recentCalls.map(call => (
              <div key={call.id} className="flex items-center gap-4 px-5 py-3">
                {/* Direction icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  call.status === "failed"
                    ? "bg-red-500/10 text-red-400"
                    : call.direction === "inbound"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}>
                  {call.status === "failed" ? (
                    <PhoneMissed className="h-4 w-4" />
                  ) : call.direction === "inbound" ? (
                    <PhoneIncoming className="h-4 w-4" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{call.id}</p>
                  <p className="text-xs text-muted-foreground">{call.agent}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-mono">{call.duration}</p>
                  <p className="text-xs text-muted-foreground">{call.time}</p>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  call.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {call.status}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 px-5 py-3 text-center">
            <a href="/usage" className="text-xs text-muted-foreground underline hover:text-foreground">
              View all agent runs →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
