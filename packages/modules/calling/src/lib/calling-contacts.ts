import type { CallingContact } from "../types/calling-contact";

const KEY = "a2m8_calling_contacts";

export function getCallingContacts(): CallingContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CallingContact[]) : [];
  } catch {
    return [];
  }
}

export function saveCallingContacts(contacts: CallingContact[]): void {
  localStorage.setItem(KEY, JSON.stringify(contacts));
}
