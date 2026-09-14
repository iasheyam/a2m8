"use client";

import { useEffect, useState } from "react";
import { Card, PageTitle, Switch } from "@a2m8/ui";
import { FEATURES, type FeatureId } from "../lib/features";
import { getEnabledFeatures, setFeatureEnabled } from "../lib/feature-flags";

export function FeaturesPage() {
  const [enabled, setEnabled] = useState<Set<FeatureId>>(new Set());

  useEffect(() => {
    setEnabled(new Set(getEnabledFeatures()));
  }, []);

  function toggle(id: FeatureId, value: boolean) {
    setFeatureEnabled(id, value);
    setEnabled(new Set(getEnabledFeatures()));
  }

  return (
    <div className="max-w-lg">
      <PageTitle className="mb-1">Features</PageTitle>
      <p className="text-ink-3 text-[13px] mb-8">
        Turn product features on or off. Deactivating a feature hides it from the nav bar.
      </p>

      <Card bodyClassName="p-0">
        <div className="divide-y divide-line-2">
          {FEATURES.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-[18px] py-3.5">
              <div>
                <p className="text-ink text-sm font-medium">{f.label}</p>
                <p className="text-ink-3 text-xs mt-0.5">{f.description}</p>
              </div>
              <Switch checked={enabled.has(f.id)} onChange={(v) => toggle(f.id, v)} label={f.label} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
