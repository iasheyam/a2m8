import type { ContactEvent, ContactEventKind } from "../types/contact-event";

const KEY = "a2m8_contact_events";

function getAllEvents(): ContactEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContactEvent[]) : [];
  } catch {
    return [];
  }
}

function saveAllEvents(events: ContactEvent[]): void {
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function getContactEvents(contactId: string): ContactEvent[] {
  return getAllEvents()
    .filter((e) => e.contactId === contactId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addContactEvent(input: {
  contactId: string;
  kind: ContactEventKind;
  text: string;
  dueAt?: string;
}): void {
  const event: ContactEvent = {
    id: crypto.randomUUID(),
    contactId: input.contactId,
    kind: input.kind,
    text: input.text,
    dueAt: input.dueAt,
    completed: input.kind === "reminder" ? false : undefined,
    createdAt: new Date().toISOString(),
  };
  saveAllEvents([...getAllEvents(), event]);
}

export function toggleReminderComplete(id: string): void {
  saveAllEvents(
    getAllEvents().map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
  );
}

export function deleteContactEvent(id: string): void {
  saveAllEvents(getAllEvents().filter((e) => e.id !== id));
}
