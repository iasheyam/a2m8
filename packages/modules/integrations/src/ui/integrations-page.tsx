"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, LogoMark, PageTitle, PencilIcon, StatusPill } from "@a2m8/ui";
import { getApiKeyCredentials, type ApiKeyCredentials } from "../lib/api-keys";
import { API_INTEGRATIONS, isIntegrationActive, type ApiIntegration } from "../lib/api-integrations";
import { IntegrationEditPanel } from "./integration-edit-panel";

export function IntegrationsPage() {
  const [credentials, setCredentials] = useState<ApiKeyCredentials>(getApiKeyCredentials());
  const [editing, setEditing] = useState<ApiIntegration | null>(null);

  useEffect(() => {
    setCredentials(getApiKeyCredentials());
  }, []);

  function refresh() {
    setCredentials(getApiKeyCredentials());
  }

  const sortedIntegrations = useMemo(
    () => [...API_INTEGRATIONS].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  return (
    <div className="max-w-2xl">
      <PageTitle className="mb-1">Integrations</PageTitle>
      <p className="text-ink-3 text-[13px] mb-8">
        API keys for third-party services this app calls on your behalf. Bring your own
        key — usage is billed to your account with the provider, not to a2m8.
      </p>

      <div className="space-y-4">
        {sortedIntegrations.map((integration) => {
          const active = isIntegrationActive(integration, credentials);
          return (
            <Card key={integration.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <LogoMark label={integration.name} domain={integration.domain} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-base font-semibold uppercase text-ink">
                        {integration.name}
                      </h2>
                      <StatusPill status={active ? "pine" : "amber"}>
                        {active ? "Active" : "Inactive"}
                      </StatusPill>
                    </div>
                    <p className="text-ink-2 text-sm">{integration.description}</p>
                  </div>
                </div>
                <Button size="sm" aria-label={`Edit ${integration.name}`} onClick={() => setEditing(integration)}>
                  <PencilIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <IntegrationEditPanel
        open={!!editing}
        integration={editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
    </div>
  );
}
