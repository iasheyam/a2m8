"use client";

import { Button, Card, LogoMark, PageTitle, StatusPill } from "@a2m8/ui";
import { PROVIDERS } from "../lib/providers";

export function ConnectionsPage() {
  return (
    <div className="max-w-2xl">
      <PageTitle className="mb-1">Connections</PageTitle>
      <p className="text-ink-3 text-[13px] mb-8">
        Accounts a2m8 connects to on your behalf. More providers land here over time.
      </p>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => (
          <Card key={provider.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <LogoMark label={provider.name} domain={provider.domain} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-base font-semibold uppercase text-ink">
                      {provider.name}
                    </h2>
                    <StatusPill status="amber">Not Connected</StatusPill>
                  </div>
                  <p className="text-ink-2 text-sm">{provider.description}</p>
                </div>
              </div>
              <Button variant="primary" disabled>Connect</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
