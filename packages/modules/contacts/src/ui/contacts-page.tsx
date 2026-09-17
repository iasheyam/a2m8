"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, ConfirmDialog, Input, PageTitle, PencilIcon, StatusPill, XIcon } from "@a2m8/ui";
import { deleteContact, getContacts } from "../lib/contacts";
import { exportContactsCsv } from "../lib/csv-export";
import { contactDisplayName, type Contact } from "../types/contact";
import { ContactEditPanel } from "./contact-edit-panel";

function statusBadge(status: string) {
  if (status === "Active" || status === "Customer") return <StatusPill status="pine">{status}</StatusPill>;
  if (status === "Lead" || status === "Prospect") return <StatusPill status="amber">{status}</StatusPill>;
  if (status === "Churned") return <StatusPill status="red">{status}</StatusPill>;
  if (status) {
    return (
      <span className="inline-flex items-center rounded-xl bg-sunken px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-2">
        {status}
      </span>
    );
  }
  return <span className="text-ink-3 text-xs">—</span>;
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        contactDisplayName(c).toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  function refresh() {
    setContacts(getContacts());
  }

  function remove(id: string) {
    deleteContact(id);
    if (editingId === id) setPanelOpen(false);
    refresh();
  }

  function openCreate() {
    setEditingId(null);
    setPanelOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setPanelOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Contacts</PageTitle>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, tag…"
            className="w-64"
          />
          <Button onClick={() => exportContactsCsv(contacts)}>Export CSV</Button>
          <Button variant="primary" onClick={openCreate}>New Contact</Button>
        </div>
      </div>

      <Card bodyClassName="p-0" className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-sunken border-b border-line">
              {["Name", "Company", "Email", "Phone", "Status", "Tags"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
              <th className="w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-2">
            {filtered.map((contact) => (
              <tr key={contact.id} className="group hover:bg-sunken transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/app/crm/contacts/${contact.id}`}
                    className="text-ink font-medium hover:text-pine transition-colors"
                  >
                    {contactDisplayName(contact) || "Untitled"}
                  </Link>
                  {contact.jobTitle && (
                    <p className="text-xs text-ink-3 mt-0.5">{contact.jobTitle}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-2">{contact.company || "—"}</td>
                <td className="px-4 py-3 text-ink-2">{contact.email || "—"}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-2">{contact.phone || "—"}</td>
                <td className="px-4 py-3">{statusBadge(contact.status)}</td>
                <td className="px-4 py-3 text-ink-3 text-xs">
                  {contact.tags.length > 0 ? contact.tags.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" aria-label="Edit contact" onClick={() => openEdit(contact.id)}>
                      <PencilIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label="Delete contact"
                      onClick={() => setConfirmDeleteId(contact.id)}
                    >
                      <XIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {contacts.length === 0 && (
        <p className="text-center py-10 text-ink-3 text-[13px]">
          No contacts yet. Add one above — mail-derived contacts will populate this
          automatically once Outlook sync is connected.
        </p>
      )}

      <ContactEditPanel
        open={panelOpen}
        contactId={editingId}
        onClose={() => setPanelOpen(false)}
        onSaved={refresh}
        onDeleted={() => { setPanelOpen(false); refresh(); }}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete contact?"
        description={
          confirmDeleteId
            ? `This will permanently delete ${
                contactDisplayName(contacts.find((c) => c.id === confirmDeleteId) ?? { firstName: "", lastName: "" })
                || "this contact"
              } and all of their notes and reminders. This can't be undone.`
            : undefined
        }
        onConfirm={() => { if (confirmDeleteId) remove(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
