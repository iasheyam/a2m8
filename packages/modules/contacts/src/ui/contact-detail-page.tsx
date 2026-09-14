"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Chip, ChevronLeftIcon, Input, PageTitle, XIcon } from "@a2m8/ui";
import { getContact, setContactTags, updateContactField } from "../lib/contacts";
import {
  addContactEvent,
  deleteContactEvent,
  getContactEvents,
  toggleReminderComplete,
} from "../lib/contact-events";
import type { Contact, ContactField } from "../types/contact";
import type { ContactEvent } from "../types/contact-event";

const FIELDS: { key: ContactField; label: string; type: string }[] = [
  { key: "name",    label: "Name",    type: "text"  },
  { key: "company", label: "Company", type: "text"  },
  { key: "phone",   label: "Phone",   type: "text"  },
  { key: "email",   label: "Email",   type: "email" },
  { key: "type",    label: "Type",    type: "text"  },
];

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<ContactEvent[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [reminderDraft, setReminderDraft] = useState("");
  const [reminderDue, setReminderDue] = useState("");

  useEffect(() => {
    const c = getContact(id);
    if (!c) { router.replace("/app/crm/contacts"); return; }
    setContact(c);
    setEvents(getContactEvents(id));
  }, [id, router]);

  if (!contact) return null;

  function updateField(field: ContactField, value: string) {
    if (!contact) return;
    updateContactField(contact.id, field, value);
    setContact(getContact(contact.id) ?? null);
  }

  function addTag() {
    if (!tagDraft.trim() || !contact) return;
    const tags = [...new Set([...contact.tags, tagDraft.trim()])];
    setContactTags(contact.id, tags);
    setContact({ ...contact, tags });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    if (!contact) return;
    const tags = contact.tags.filter((t) => t !== tag);
    setContactTags(contact.id, tags);
    setContact({ ...contact, tags });
  }

  function addNote() {
    if (!noteDraft.trim() || !contact) return;
    addContactEvent({ contactId: contact.id, kind: "note", text: noteDraft.trim() });
    setEvents(getContactEvents(contact.id));
    setNoteDraft("");
  }

  function addReminder() {
    if (!reminderDraft.trim() || !contact) return;
    addContactEvent({
      contactId: contact.id,
      kind: "reminder",
      text: reminderDraft.trim(),
      dueAt: reminderDue || undefined,
    });
    setEvents(getContactEvents(contact.id));
    setReminderDraft("");
    setReminderDue("");
  }

  function toggleReminder(eventId: string) {
    if (!contact) return;
    toggleReminderComplete(eventId);
    setEvents(getContactEvents(contact.id));
  }

  function removeEvent(eventId: string) {
    if (!contact) return;
    deleteContactEvent(eventId);
    setEvents(getContactEvents(contact.id));
  }

  const reminders = events.filter((e) => e.kind === "reminder");
  const notes = events.filter((e) => e.kind === "note");

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/app/crm/contacts")}
        className="text-xs text-ink-3 hover:text-ink transition-colors mb-3 flex items-center gap-1"
      >
        <ChevronLeftIcon className="w-3.5 h-3.5" /> Contacts
      </button>

      <PageTitle className="mb-6">{contact.name || "Untitled contact"}</PageTitle>

      <Card className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1">
                {f.label}
              </label>
              <Input
                type={f.type}
                value={contact[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-8">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-2">Tags</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {contact.tags.map((tag) => (
            <Chip key={tag} onRemove={() => removeTag(tag)}>{tag}</Chip>
          ))}
          {contact.tags.length === 0 && <span className="text-ink-3 text-xs">No tags yet</span>}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
            placeholder="Add a tag…"
            className="w-48"
          />
          <Button size="sm" onClick={addTag}>Add</Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-2">Reminders</p>
        <div className="space-y-2 mb-3">
          {reminders.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded border border-line px-3 py-2">
              <label className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={!!e.completed}
                  onChange={() => toggleReminder(e.id)}
                  className="accent-pine w-4 h-4"
                />
                <span className={`text-sm truncate ${e.completed ? "line-through text-ink-3" : "text-ink-2"}`}>
                  {e.text}
                </span>
              </label>
              <div className="flex items-center gap-2 shrink-0">
                {e.dueAt && <span className="font-mono text-[10px] text-ink-3">{new Date(e.dueAt).toLocaleDateString()}</span>}
                <button onClick={() => removeEvent(e.id)} className="text-ink-3 hover:text-red transition-colors">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {reminders.length === 0 && <p className="text-ink-3 text-xs">No reminders yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={reminderDraft}
            onChange={(e) => setReminderDraft(e.target.value)}
            placeholder="Follow up about…"
            className="flex-1"
          />
          <Input
            type="date"
            value={reminderDue}
            onChange={(e) => setReminderDue(e.target.value)}
          />
          <Button variant="primary" size="sm" onClick={addReminder}>Add</Button>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-2">Notes</p>
        <div className="space-y-2 mb-3">
          {notes.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded border border-line px-3 py-2">
              <div>
                <p className="text-sm text-ink-2">{e.text}</p>
                <p className="font-mono text-[10px] text-ink-3 mt-0.5">
                  {new Date(e.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button onClick={() => removeEvent(e.id)} className="text-ink-3 hover:text-red transition-colors shrink-0">
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {notes.length === 0 && <p className="text-ink-3 text-xs">No notes yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
            placeholder="Add a note…"
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={addNote}>Add</Button>
        </div>
      </div>
    </div>
  );
}
