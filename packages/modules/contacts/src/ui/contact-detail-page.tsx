"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Chip, ChevronLeftIcon, Input, PageTitle, XIcon } from "@a2m8/ui";
import { getContact, setContactTags } from "../lib/contacts";
import {
  addContactEvent,
  deleteContactEvent,
  getContactEvents,
  toggleReminderComplete,
} from "../lib/contact-events";
import { contactDisplayName, type Contact } from "../types/contact";
import type { ContactEvent } from "../types/contact-event";
import { ContactEditPanel } from "./contact-edit-panel";
import { NotesSection } from "./notes-section";

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-0.5">{label}</p>
      <p className="text-sm text-ink">{value?.trim() ? value : <span className="text-ink-3">—</span>}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="font-display text-base font-semibold uppercase tracking-wide text-ink-2 mb-3 pb-2 border-b border-line-2">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<ContactEvent[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [reminderDraft, setReminderDraft] = useState("");
  const [reminderDue, setReminderDue] = useState("");

  function refresh() {
    const c = getContact(id);
    if (!c) { router.replace("/app/crm/contacts"); return; }
    setContact(c);
    setEvents(getContactEvents(id));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!contact) return null;

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
  const address = [contact.street, [contact.city, contact.state].filter(Boolean).join(", "), contact.postalCode, contact.country]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/app/crm/contacts")}
        className="text-xs text-ink-3 hover:text-ink transition-colors mb-3 flex items-center gap-1"
      >
        <ChevronLeftIcon className="w-3.5 h-3.5" /> Contacts
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <PageTitle>{contactDisplayName(contact) || "Untitled contact"}</PageTitle>
          {contact.jobTitle && <p className="text-ink-3 text-sm mt-1">{contact.jobTitle}{contact.company ? ` at ${contact.company}` : ""}</p>}
        </div>
        <Button variant="primary" onClick={() => setPanelOpen(true)}>Edit</Button>
      </div>

      <Card className="mb-8">
        <Section title="Contact Info">
          <InfoField label="Email" value={contact.email} />
          <InfoField label="Secondary Email" value={contact.secondaryEmail} />
          <InfoField label="Work Phone" value={contact.phone} />
          <InfoField label="Mobile Phone" value={contact.mobilePhone} />
          <InfoField label="Website" value={contact.website} />
          <InfoField label="LinkedIn" value={contact.linkedinUrl} />
        </Section>

        <Section title="Address">
          <div className="col-span-2">
            <InfoField label="Address" value={address} />
          </div>
        </Section>

        <Section title="CRM Details">
          <InfoField label="Type" value={contact.type} />
          <InfoField label="Status" value={contact.status} />
          <InfoField label="Source" value={contact.source} />
          <InfoField label="Department" value={contact.department} />
        </Section>

        {contact.summary && (
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1">Summary</p>
            <p className="text-sm text-ink-2 leading-relaxed">{contact.summary}</p>
          </div>
        )}
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
        <NotesSection contactId={contact.id} />
      </div>

      <ContactEditPanel
        open={panelOpen}
        contactId={contact.id}
        onClose={() => setPanelOpen(false)}
        onSaved={refresh}
        onDeleted={() => router.replace("/app/crm/contacts")}
      />
    </div>
  );
}
