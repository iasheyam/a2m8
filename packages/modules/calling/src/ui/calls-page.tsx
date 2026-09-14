"use client";

import { useEffect, useState } from "react";
import { Button, Card, ChevronDownIcon, ChevronRightIcon, PageTitle, StatusPill, XIcon } from "@a2m8/ui";
import { getCallLogs, updateCallOutcome, updateCallLogs } from "../lib/call-logs";
import { getSettings } from "../lib/settings";
import type { CallLog, CallOutcome } from "../types/call-log";

type OutcomeStatus = "pine" | "amber" | "red" | "neutral";

const OUTCOMES: { value: CallOutcome; label: string; status: OutcomeStatus }[] = [
  { value: "interested",     label: "Interested",     status: "pine"    },
  { value: "callback",       label: "Callback",       status: "amber"   },
  { value: "no_answer",      label: "No Answer",      status: "neutral" },
  { value: "voicemail",      label: "Voicemail",      status: "amber"   },
  { value: "not_interested", label: "Not Interested", status: "red"     },
];

function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
  const o = OUTCOMES.find((x) => x.value === outcome);
  if (!o) return null;
  if (o.status === "neutral") {
    return (
      <span className="inline-flex items-center rounded-xl bg-sunken px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-2">
        {o.label}
      </span>
    );
  }
  return <StatusPill status={o.status}>{o.label}</StatusPill>;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function CallsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getCallLogs());
  }, []);

  const unpollled = logs.filter((l) => l.vapiCallId && !l.polled);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setOutcome(id: string, outcome: CallOutcome) {
    updateCallOutcome(id, outcome);
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, outcome } : l)));
    setOpenMenu(null);
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    const { vapiApiKey } = getSettings();
    const toFetch = logs.filter((l) => l.vapiCallId && !l.polled);

    try {
      const results = await Promise.all(
        toFetch.map(async (log) => {
          try {
            const res = await fetch("/api/vapi-call", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callId: log.vapiCallId, vapiApiKey }),
            });
            const data = await res.json();
            return {
              id: log.id,
              polled: true,
              transcript: data.transcript ?? undefined,
              duration: data.duration ?? undefined,
              endedReason: data.endedReason ?? undefined,
            };
          } catch {
            return { id: log.id, polled: true };
          }
        })
      );

      updateCallLogs(results);
      setLogs((prev) =>
        prev.map((l) => {
          const update = results.find((r) => r.id === l.id);
          return update ? { ...l, ...update } : l;
        })
      );
    } catch {
      setError("Failed to refresh call data.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Call Logs</PageTitle>
        {unpollled.length > 0 && (
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Fetching transcripts…" : `Refresh (${unpollled.length} pending)`}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 mb-6 rounded-sm border border-red/30 bg-red-soft px-4 py-3 text-[13px] text-red">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-red hover:opacity-70 transition-opacity">
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-24 text-ink-3 text-[13px]">
          No calls yet. Go to Leads and hit Call.
        </div>
      ) : (
        <Card bodyClassName="p-0" className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sunken border-b border-line">
                {["", "Contact", "Company", "Phone", "Called At", "Duration", "Outcome"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-line-2 last:border-0 hover:bg-sunken transition-colors"
                  >
                    {/* Expand toggle */}
                    <td className="pl-3 pr-1 py-3 w-6">
                      {log.transcript ? (
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="text-ink-3 hover:text-ink transition-colors"
                        >
                          {expanded.has(log.id) ? (
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRightIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-ink-3 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink font-medium">{log.contactName}</td>
                    <td className="px-4 py-3 text-ink-2">{log.company || "—"}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-2">{log.phone}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                      {new Date(log.calledAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                      {log.duration != null ? formatDuration(log.duration) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        {log.outcome ? (
                          <button onClick={() => setOpenMenu(openMenu === log.id ? null : log.id)}>
                            <OutcomeBadge outcome={log.outcome} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setOpenMenu(openMenu === log.id ? null : log.id)}
                            className="px-2.5 py-1 rounded-sm border border-line text-ink-3 hover:text-ink hover:border-ink-3 text-xs transition-colors"
                          >
                            Set outcome
                          </button>
                        )}
                        {openMenu === log.id && (
                          <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-line rounded shadow-lg overflow-hidden min-w-[160px]">
                            {OUTCOMES.map((o) => (
                              <button
                                key={o.value}
                                onClick={() => setOutcome(log.id, o.value)}
                                className="w-full text-left px-3 py-2 text-xs text-ink-2 hover:bg-sunken transition-colors"
                              >
                                {o.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Transcript row */}
                  {expanded.has(log.id) && log.transcript && (
                    <tr key={`${log.id}-transcript`} className="border-b border-line-2 bg-sunken">
                      <td />
                      <td colSpan={6} className="px-4 py-4">
                        <p className="font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider mb-2">
                          Transcript
                        </p>
                        <pre className="text-[13px] text-ink-2 whitespace-pre-wrap leading-relaxed font-body">
                          {log.transcript}
                        </pre>
                        {log.endedReason && (
                          <p className="mt-3 text-xs text-ink-3">
                            Ended: {log.endedReason.replace(/-/g, " ")}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
