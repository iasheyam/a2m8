"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, PageTitle } from "@a2m8/ui";
import { getSettings, saveSettings, type Settings } from "../lib/settings";

const FIELDS: { key: keyof Settings; label: string; placeholder: string; secret?: boolean }[] = [
  { key: "agentName",         label: "Agent Name",          placeholder: "e.g. Alex",  secret: false },
  { key: "vapiApiKey",        label: "VAPI API Key",        placeholder: "sk-...",     secret: true  },
  { key: "vapiPhoneNumberId", label: "Phone Number ID",     placeholder: "pn_...",     secret: true  },
  { key: "vapiAssistantId",   label: "Assistant ID",        placeholder: "asst_...",   secret: true  },
];

export function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    agentName: "",
    vapiApiKey: "",
    vapiPhoneNumberId: "",
    vapiAssistantId: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(getSettings());
  }, []);

  function handleSave() {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg">
      <PageTitle className="mb-1">Settings</PageTitle>
      <p className="text-ink-3 text-[13px] mb-8">VAPI credentials for outbound calling.</p>

      <Card>
        <div className="space-y-5">
          {FIELDS.map(({ key, label, placeholder, secret }) => (
            <div key={key}>
              <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                {label}
              </label>
              <Input
                type={secret ? "password" : "text"}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <Button variant="primary" onClick={handleSave} className="mt-8">
          {saved ? "Saved!" : "Save"}
        </Button>
      </Card>
    </div>
  );
}
