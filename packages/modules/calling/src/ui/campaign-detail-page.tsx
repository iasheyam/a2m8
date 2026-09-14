"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, ChevronLeftIcon, Input, MetaText, PageTitle } from "@a2m8/ui";
import { getCampaign, updateCampaign } from "../lib/campaigns";
import { getCallingContacts } from "../lib/calling-contacts";
import type { Campaign } from "../types/campaign";
import type { CallingContact } from "../types/calling-contact";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [allContacts, setAllContacts] = useState<CallingContact[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [promptExpanded, setPromptExpanded] = useState(false);

  useEffect(() => {
    const c = getCampaign(id);
    if (!c) { router.replace("/app/voice-ai/campaigns"); return; }
    setCampaign(c);
    setAllContacts(getCallingContacts());
  }, [id, router]);

  if (!campaign) return null;

  const campaignContacts = allContacts.filter((c) =>
    campaign.contactIds.includes(c.id)
  );

  const addableContacts = allContacts.filter(
    (c) => !campaign.contactIds.includes(c.id)
  );

  const filtered = search
    ? addableContacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company.toLowerCase().includes(search.toLowerCase())
      )
    : addableContacts;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAddContacts() {
    if (selected.size === 0 || !campaign) return;
    const updated: Campaign = {
      ...campaign,
      contactIds: [...campaign.contactIds, ...Array.from(selected)],
    };
    updateCampaign(updated);
    setCampaign(updated);
    setSelected(new Set());
    setSearch("");
    setAddModal(false);
  }

  function handleRemoveContact(contactId: string) {
    if (!campaign) return;
    const updated: Campaign = {
      ...campaign,
      contactIds: campaign.contactIds.filter((id) => id !== contactId),
    };
    updateCampaign(updated);
    setCampaign(updated);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/app/voice-ai/campaigns")}
          className="text-xs text-ink-3 hover:text-ink transition-colors mb-3 flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Campaigns
        </button>
        <PageTitle>{campaign.name}</PageTitle>
        <MetaText className="mt-1 block">
          Created{" "}
          {new Date(campaign.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </MetaText>
      </div>

      {/* Prompt section */}
      {campaign.prompt && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
              Call Prompt
            </p>
            <button
              onClick={() => setPromptExpanded((v) => !v)}
              className="text-xs text-ink-3 hover:text-ink transition-colors"
            >
              {promptExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          <pre
            className={`mt-3 text-[13px] text-ink-2 whitespace-pre-wrap leading-relaxed font-body overflow-hidden transition-all ${
              promptExpanded ? "" : "max-h-16"
            }`}
          >
            {campaign.prompt}
          </pre>
          {!promptExpanded && (
            <div className="h-6 bg-gradient-to-t from-card to-transparent -mt-6 relative" />
          )}
        </Card>
      )}

      {/* Contacts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold uppercase text-ink">
          Contacts{" "}
          <span className="font-body text-sm font-normal normal-case text-ink-3">({campaignContacts.length})</span>
        </h2>
        <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>Add Contacts</Button>
      </div>

      {campaignContacts.length === 0 ? (
        <div className="text-center py-16 text-ink-3 text-[13px] rounded border border-line">
          No contacts yet. Click "Add Contacts" to add from your contact list.
        </div>
      ) : (
        <Card bodyClassName="p-0" className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sunken border-b border-line">
                {["Name", "Company", "Phone", "Type", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 font-mono text-[10px] font-medium text-ink-3 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-2">
              {campaignContacts.map((contact) => (
                <tr key={contact.id} className="group hover:bg-sunken transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">{contact.name}</td>
                  <td className="px-4 py-3 text-ink-2">{contact.company || "—"}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-2">{contact.phone}</td>
                  <td className="px-4 py-3 text-ink-3 text-xs">{contact.businessType || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-ink-3 hover:text-red transition-all"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add contacts modal */}
      {addModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60"
          onClick={(e) => e.target === e.currentTarget && setAddModal(false)}
        >
          <div className="w-full max-w-lg bg-card rounded border border-line shadow-lg flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-line">
              <h2 className="font-display text-xl font-semibold uppercase text-ink">Add Contacts</h2>
              <MetaText className="mt-1 block">
                {addableContacts.length} contact{addableContacts.length !== 1 ? "s" : ""} available
              </MetaText>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or company…"
                autoFocus
                className="mt-3 w-full"
              />
            </div>

            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-ink-3 text-[13px]">No contacts found.</p>
              ) : (
                filtered.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-sunken cursor-pointer border-b border-line-2 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="accent-pine w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-ink-3 text-xs truncate">
                        {contact.company || "—"} {contact.businessType ? `· ${contact.businessType}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-ink-3 shrink-0">{contact.phone}</span>
                  </label>
                ))
              )}
            </div>

            <div className="p-4 border-t border-line flex items-center justify-between">
              <span className="text-xs text-ink-3">
                {selected.size > 0 ? `${selected.size} selected` : "None selected"}
              </span>
              <div className="flex gap-3">
                <Button onClick={() => { setAddModal(false); setSearch(""); setSelected(new Set()); }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddContacts} disabled={selected.size === 0}>
                  Add {selected.size > 0 ? selected.size : ""} Contact{selected.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
