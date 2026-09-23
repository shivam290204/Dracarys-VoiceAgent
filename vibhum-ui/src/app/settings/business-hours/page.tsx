"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";

export default function BusinessHoursPage() {
  const { user, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);

  const [enabled, setEnabled] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [afterHoursWorkflowId, setAfterHoursWorkflowId] = useState<string>("");
  const [schedule, setSchedule] = useState({
    monday: [{ start: "09:00", end: "17:00" }],
    tuesday: [{ start: "09:00", end: "17:00" }],
    wednesday: [{ start: "09:00", end: "17:00" }],
    thursday: [{ start: "09:00", end: "17:00" }],
    friday: [{ start: "09:00", end: "17:00" }],
    saturday: [],
    sunday: [],
  });

  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const token = await getAccessToken();
        const [bwRes, wfRes] = await Promise.all([
          fetch("/api/v1/organizations/business-hours", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/v1/workflows", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (wfRes.ok) {
          const wfData = await wfRes.json();
          setWorkflows(wfData || []);
        }

        if (bwRes.ok) {
          const data = await bwRes.json();
          setEnabled(data.enabled ?? false);
          setTimezone(data.timezone || "UTC");
          if (data.after_hours_workflow_id) {
            setAfterHoursWorkflowId(data.after_hours_workflow_id.toString());
          }
          if (data.schedule) {
            setSchedule({
              monday: data.schedule.monday || [],
              tuesday: data.schedule.tuesday || [],
              wednesday: data.schedule.wednesday || [],
              thursday: data.schedule.thursday || [],
              friday: data.schedule.friday || [],
              saturday: data.schedule.saturday || [],
              sunday: data.schedule.sunday || [],
            });
          }
        }
      } catch (err) {
        console.error("Failed to load business hours:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/v1/organizations/business-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled,
          timezone,
          after_hours_workflow_id: afterHoursWorkflowId ? parseInt(afterHoursWorkflowId) : null,
          schedule,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Business hours saved successfully.");
    } catch (err) {
      toast.error("Could not save business hours.");
    } finally {
      setSaving(false);
    }
  };

  const handleDayChange = (day: string, active: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: active ? [{ start: "09:00", end: "17:00" }] : [],
    }));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Business Hours & Routing</h1>
        <p className="text-gray-500 mt-2">
          Configure when your business is open. Calls received outside these hours
          will automatically route to your designated After-Hours agent.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Enable After-Hours Routing</Label>
            <p className="text-sm text-gray-500">Automatically switch agents based on time of day.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-4 pt-4 border-t">
              <Label>After-Hours Agent</Label>
              <Select value={afterHoursWorkflowId} onValueChange={setAfterHoursWorkflowId}>
                <SelectTrigger className="w-full sm:w-[400px]">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((wf) => (
                    <SelectItem key={wf.id} value={wf.id.toString()}>
                      {wf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                This agent will handle calls received outside of the hours configured below.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full sm:w-[400px]">
                  <SelectValue placeholder="Select timezone..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                  <SelectItem value="Europe/London">London (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t space-y-4">
              <Label>Weekly Schedule</Label>
              <div className="space-y-3">
                {DAYS.map((day) => {
                  const slots = (schedule as any)[day];
                  const isOpen = slots && slots.length > 0;
                  return (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-32 flex items-center space-x-2">
                        <Switch
                          checked={isOpen}
                          onCheckedChange={(c) => handleDayChange(day, c)}
                        />
                        <span className="capitalize">{day}</span>
                      </div>
                      {isOpen ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            className="border rounded p-1 text-sm"
                            value={slots[0].start}
                            onChange={(e) => {
                              const newSchedule = { ...schedule };
                              (newSchedule as any)[day][0].start = e.target.value;
                              setSchedule(newSchedule);
                            }}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            className="border rounded p-1 text-sm"
                            value={slots[0].end}
                            onChange={(e) => {
                              const newSchedule = { ...schedule };
                              (newSchedule as any)[day][0].end = e.target.value;
                              setSchedule(newSchedule);
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
