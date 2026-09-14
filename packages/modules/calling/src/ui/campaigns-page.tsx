"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Input, PageTitle, Textarea, XIcon } from "@a2m8/ui";
import { getCampaigns, saveCampaigns, deleteCampaign } from "../lib/campaigns";
import type { Campaign } from "../types/campaign";

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    setCampaigns(getCampaigns());
  }, []);

  function handleCreate() {
    if (!name.trim()) return;
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      name: name.trim(),
      prompt: prompt.trim() || undefined,
      contactIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [campaign, ...campaigns];
    saveCampaigns(updated);
    setCampaigns(updated);
    setName("");
    setPrompt("");
    setModal(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Campaigns</PageTitle>
        <Button variant="primary" onClick={() => setModal(true)}>New Campaign</Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-24 text-ink-3 text-[13px]">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <Card bodyClassName="p-0" className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sunken border-b border-line">
                {["Name", "Contacts", "Created", ""].map((h) => (
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
              {campaigns.map((c) => (
                <tr key={c.id} className="group hover:bg-sunken transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/voice-ai/campaigns/${c.id}`}
                      className="text-ink font-medium hover:text-pine transition-colors"
                    >
                      {c.name}
                    </Link>
                    {c.prompt && (
                      <p className="text-xs text-ink-3 mt-0.5 truncate max-w-xs">
                        {c.prompt}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-2">
                    {c.contactIds.length} contact{c.contactIds.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/app/voice-ai/campaigns/${c.id}`}>
                        <Button size="sm">Open</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                        <XIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="w-full max-w-lg bg-card rounded border border-line shadow-lg p-6">
            <h2 className="font-display text-xl font-semibold uppercase text-ink mb-5">New Campaign</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  Campaign Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Local Restaurants May"
                  autoFocus
                  className="w-full"
                />
              </div>
              <div>
                <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  Call Prompt{" "}
                  <span className="normal-case font-body font-normal text-ink-3">(optional — overrides default)</span>
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  placeholder="Paste your custom call script here…"
                  className="w-full resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => { setModal(false); setName(""); setPrompt(""); }}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>Create Campaign</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
