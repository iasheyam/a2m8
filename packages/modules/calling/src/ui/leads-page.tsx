"use client";

import { useEffect, useState } from "react";
import { Button, Card, PageTitle, StatusPill, XIcon } from "@a2m8/ui";
import { getCallingContacts, saveCallingContacts } from "../lib/calling-contacts";
import { getSettings } from "../lib/settings";
import { addCallLog } from "../lib/call-logs";
import { SearchSelect } from "./search-select";
import { formatPhoneE164 } from "../lib/phone";
import type { CallingContact } from "../types/calling-contact";

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Bar / Pub",
  "Salon",
  "Barbershop",
  "Spa",
  "Gym / Fitness",
  "Retail Store",
  "Bakery",
  "Plumber",
  "Electrician",
  "HVAC",
  "Contractor",
  "Landscaping",
  "Cleaning Service",
  "Auto Repair",
  "Dentist",
  "Medical / Clinic",
  "Law Firm",
  "Accounting",
  "Real Estate",
  "Hotel / B&B",
  "Photography",
  "Childcare",
  "Other",
];

type ColDef =
  | { key: keyof CallingContact; label: string; kind: "input"; placeholder: string; type: string; format?: (v: string) => string }
  | { key: keyof CallingContact; label: string; kind: "combobox"; options: string[] };

const COLS: ColDef[] = [
  { key: "name",         label: "Name",    kind: "input",  placeholder: "Name *",   type: "text"  },
  { key: "company",      label: "Company", kind: "input",  placeholder: "Company",  type: "text"  },
  { key: "phone",        label: "Phone",   kind: "input",  placeholder: "Phone *",  type: "text",  format: formatPhoneE164 },
  { key: "email",        label: "Email",   kind: "input",  placeholder: "Email",    type: "email" },
  { key: "businessType", label: "Type",    kind: "combobox", options: BUSINESS_TYPES },
  { key: "website",      label: "Website", kind: "input",  placeholder: "https://", type: "url"   },
];

type EditableField = (typeof COLS)[number]["key"];

const cellClass =
  "w-full bg-transparent text-ink text-[13px] px-2 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-pine hover:bg-sunken transition-colors";

const emptyDraft = (): Partial<Record<EditableField, string>> => ({});

function callStatusPill(status: string) {
  if (status === "Called") return <StatusPill status="pine">Called</StatusPill>;
  if (status === "Failed") return <StatusPill status="red">Failed</StatusPill>;
  if (status) return <StatusPill status="amber">{status}</StatusPill>;
  return <span className="text-ink-3 text-xs">—</span>;
}

export function LeadsPage() {
  const [contacts, setContacts] = useState<CallingContact[]>([]);
  const [draft, setDraft] = useState(emptyDraft());
  const [calling, setCalling] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContacts(getCallingContacts());
  }, []);

  function updateContact(id: string, field: EditableField, value: string) {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setContacts(updated);
    saveCallingContacts(updated);
  }

  function deleteContact(id: string) {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveCallingContacts(updated);
  }

  function commitDraft() {
    if (!draft.name?.trim() || !draft.phone?.trim()) return;
    const newContact: CallingContact = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      company: draft.company?.trim() ?? "",
      phone: draft.phone.trim(),
      email: draft.email?.trim() ?? "",
      businessType: draft.businessType ?? "",
      website: draft.website?.trim() ?? "",
      createdAt: new Date().toISOString(),
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveCallingContacts(updated);
    setDraft(emptyDraft());
  }

  async function handleCall(contact: CallingContact) {
    setCalling(contact.id);
    setError(null);
    setCallStatus((prev) => ({ ...prev, [contact.id]: "Initiating…" }));
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contact.phone, name: contact.name, company: contact.company, ...getSettings() }),
      });
      const data = await res.json();
      if (res.ok) {
        addCallLog({
          id: crypto.randomUUID(),
          contactId: contact.id,
          contactName: contact.name,
          company: contact.company,
          phone: contact.phone,
          calledAt: new Date().toISOString(),
          vapiCallId: data.id,
        });
        setCallStatus((prev) => ({ ...prev, [contact.id]: `Called` }));
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setCallStatus((prev) => ({ ...prev, [contact.id]: "Failed" }));
      }
    } catch {
      setError("Network error. Could not reach the server.");
      setCallStatus((prev) => ({ ...prev, [contact.id]: "Failed" }));
    } finally {
      setCalling(null);
    }
  }

  function renderCell(col: ColDef, value: string, onChange: (v: string) => void, isDraft = false) {
    if (col.kind === "combobox") {
      return (
        <SearchSelect
          value={value}
          options={col.options}
          onChange={onChange}
          placeholder="Type"
        />
      );
    }
    return (
      <input
        type={col.type}
        value={value}
        placeholder={isDraft ? col.placeholder : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={col.format ? () => { const f = col.format!(value); if (f !== value) onChange(f); } : undefined}
        onKeyDown={isDraft ? (e) => { if (e.key === "Enter") commitDraft(); } : undefined}
        className={`${cellClass} ${isDraft ? "placeholder:text-ink-3" : ""}`}
      />
    );
  }

  return (
    <div>
      <PageTitle className="mb-6">Leads</PageTitle>

      {error && (
        <div className="flex items-start justify-between gap-3 mb-6 rounded-sm border border-red/30 bg-red-soft px-4 py-3 text-[13px] text-red">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red hover:opacity-70 transition-opacity"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Card bodyClassName="p-0" className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-sunken border-b border-line">
              {COLS.map(({ key, label }) => (
                <th
                  key={key as string}
                  className="text-left px-3 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider"
                >
                  {label}
                </th>
              ))}
              <th className="text-left px-3 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider">
                Call Status
              </th>
              <th className="text-left px-3 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider">
                Added
              </th>
              <th className="w-24" />
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="group border-b border-line-2 last:border-0 hover:bg-sunken transition-colors"
              >
                {COLS.map((col) => (
                  <td key={col.key as string} className="px-1 py-0.5">
                    {renderCell(
                      col,
                      (contact[col.key] as string) ?? "",
                      (v) => updateContact(contact.id, col.key, v)
                    )}
                  </td>
                ))}
                <td className="px-3 py-1 whitespace-nowrap">
                  {callStatusPill(callStatus[contact.id] ?? "")}
                </td>
                <td className="px-3 py-1 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                  {new Date(contact.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCall(contact)}
                      disabled={calling === contact.id}
                    >
                      {calling === contact.id ? "…" : "Call"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteContact(contact.id)}>
                      <XIcon className="w-3 h-3" />
                    </Button>
                  </div>
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
                <td key={col.key as string} className="px-1 py-0.5">
                  {renderCell(
                    col,
                    draft[col.key] ?? "",
                    (v) => setDraft((d) => ({ ...d, [col.key]: v })),
                    true
                  )}
                </td>
              ))}
              <td colSpan={3} />
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
