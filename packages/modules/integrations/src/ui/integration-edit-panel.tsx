"use client";

import { useEffect, useState } from "react";
import { Button, Input, SlidePanel } from "@a2m8/ui";
import { getApiKeyCredentials, saveApiKeyCredentials, type ApiKeyCredentials } from "../lib/api-keys";
import type { ApiIntegration } from "../lib/api-integrations";

export function IntegrationEditPanel({
  open,
  integration,
  onClose,
  onSaved,
}: {
  open: boolean;
  integration: ApiIntegration | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<ApiKeyCredentials>(getApiKeyCredentials());

  useEffect(() => {
    if (open) setValues(getApiKeyCredentials());
  }, [open]);

  function set(key: keyof ApiKeyCredentials, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSave() {
    saveApiKeyCredentials(values);
    onSaved();
    onClose();
  }

  return (
    <SlidePanel
      open={open && !!integration}
      title={integration?.name ?? ""}
      onClose={onClose}
      footer={
        <>
          <span />
          <div className="flex gap-3">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </div>
        </>
      }
    >
      <div className="space-y-5">
        {integration?.fields.map((field) => (
          <div key={field.key}>
            <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
              {field.label}
            </label>
            <Input
              type={field.required === false ? "text" : "password"}
              value={values[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </SlidePanel>
  );
}
