"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, Input, PageTitle, XIcon } from "@a2m8/ui";
import { createContact, deleteContact, getContacts, updateContactField } from "../lib/contacts";
import { exportContactsCsv } from "../lib/csv-export";
import type { Contact, ContactField } from "../types/contact";

type ColDef = { key: ContactField; label: string; placeholder: string; type: string };

const COLS: ColDef[] = [
  { key: "name",    label: "Name",    placeholder: "Name *",   type: "text"  },
  { key: "company", label: "Company", placeholder: "Company",  type: "text"  },
  { key: "phone",   label: "Phone",   placeholder: "Phone",    type: "text"  },
  { key: "email",   label: "Email",   placeholder: "Email",    type: "email" },
  { key: "type",    label: "Type",    placeholder: "Type",     type: "text"  },
];

const cellClass =
  "w-full bg-transparent text-ink text-[13px] px-2 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-pine hover:bg-sunken transition-colors";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Partial<Record<ContactField, string>>>({});

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  function updateField(id: string, field: ContactField, value: string) {
    updateContactField(id, field, value);
    setContacts(getContacts());
  }

  function remove(id: string) {
    deleteContact(id);
    setContacts(getContacts());
  }

  function commitDraft() {
    if (!draft.name?.trim()) return;
    createContact({
      name: draft.name.trim(),
      company: draft.company?.trim(),
      phone: draft.phone?.trim(),
      email: draft.email?.trim(),
      type: draft.type?.trim(),
    });
    setContacts(getContacts());
    setDraft({});
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
        </div>
      </div>

      <Card bodyClassName="p-0" className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-sunken border-b border-line">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="text-left px-3 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider"
                >
                  {c.label}
                </th>
              ))}
              <th className="text-left px-3 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider">
                Tags
              </th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((contact) => (
              <tr
                key={contact.id}
                className="group border-b border-line-2 last:border-0 hover:bg-sunken transition-colors"
              >
                {COLS.map((col) =>
                  col.key === "name" ? (
                    <td key={col.key} className="px-1 py-0.5">
                      <Link
                        href={`/app/crm/contacts/${contact.id}`}
                        className="text-ink font-medium hover:text-pine transition-colors px-2 py-1.5 inline-block"
                      >
                        {contact.name || "Untitled"}
                      </Link>
                    </td>
                  ) : (
                    <td key={col.key} className="px-1 py-0.5">
                      <input
                        type={col.type}
                        value={contact[col.key]}
                        onChange={(e) => updateField(contact.id, col.key, e.target.value)}
                        className={cellClass}
                      />
                    </td>
                  )
                )}
                <td className="px-3 py-1.5 text-ink-3 text-xs">
                  {contact.tags.length > 0 ? contact.tags.join(", ") : "—"}
                </td>
                <td className="px-2 py-1 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(contact.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <XIcon className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}

            <tr
              className="border-t border-line bg-sunken"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) commitDraft();
              }}
            >
              {COLS.map((col) => (
                <td key={col.key} className="px-1 py-0.5">
                  <input
                    type={col.type}
                    value={draft[col.key] ?? ""}
                    placeholder={col.placeholder}
                    onChange={(e) => setDraft((d) => ({ ...d, [col.key]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") commitDraft(); }}
                    className={`${cellClass} placeholder:text-ink-3`}
                  />
                </td>
              ))}
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </Card>

      {contacts.length === 0 && (
        <p className="text-center py-10 text-ink-3 text-[13px]">
          No contacts yet. Add one above — mail-derived contacts will populate this
          automatically once Outlook sync is connected.
        </p>
      )}
    </div>
  );
}
