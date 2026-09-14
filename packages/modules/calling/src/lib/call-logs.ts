import type { CallLog, CallOutcome } from "../types/call-log";

const KEY = "a2m8_call_logs";

export function getCallLogs(): CallLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CallLog[]) : [];
  } catch {
    return [];
  }
}

export function addCallLog(log: CallLog): void {
  const logs = getCallLogs();
  localStorage.setItem(KEY, JSON.stringify([log, ...logs]));
}

export function updateCallOutcome(id: string, outcome: CallOutcome): void {
  const logs = getCallLogs().map((l) =>
    l.id === id ? { ...l, outcome } : l
  );
  localStorage.setItem(KEY, JSON.stringify(logs));
}

export function updateCallLogs(updates: Partial<CallLog>[]): void {
  const map = new Map(updates.map((u) => [u.id!, u]));
  const logs = getCallLogs().map((l) =>
    map.has(l.id) ? { ...l, ...map.get(l.id) } : l
  );
  localStorage.setItem(KEY, JSON.stringify(logs));
}
