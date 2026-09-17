"use client";

import { useEffect, useState } from "react";
import { Button, Input, XIcon } from "@a2m8/ui";
import { addContactEvent, deleteContactEvent, getContactEvents } from "../lib/contact-events";
import type { ContactEvent } from "../types/contact-event";

export function NotesSection({ contactId }: { contactId: string }) {
  const [notes, setNotes] = useState<ContactEvent[]>([]);
  const [draft, setDraft] = useState("");

  function refresh() {
    setNotes(getContactEvents(contactId).filter((e) => e.kind === "note"));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  function addNote() {
    if (!draft.trim()) return;
    addContactEvent({ contactId, kind: "note", text: draft.trim() });
    refresh();
    setDraft("");
  }

  function removeNote(id: string) {
    deleteContactEvent(id);
    refresh();
  }

  return (
    <div>
      <div className="space-y-2 mb-3">
        {notes.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 rounded border border-line px-3 py-2">
            <div>
              <p className="text-sm text-ink-2">{n.text}</p>
              <p className="font-mono text-[10px] text-ink-3 mt-0.5">
                {new Date(n.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button onClick={() => removeNote(n.id)} className="text-ink-3 hover:text-red transition-colors shrink-0">
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {notes.length === 0 && <p className="text-ink-3 text-xs">No notes yet.</p>}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
          placeholder="Add a note…"
          className="flex-1"
        />
        <Button size="sm" onClick={addNote}>Add</Button>
      </div>
    </div>
  );
}
