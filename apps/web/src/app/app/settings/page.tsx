import { PageTitle } from "@a2m8/ui";

// Reserved for org-wide settings that aren't tied to a specific integration
// or feature — team & invitations, plan/billing, usage, export. None of
// that exists yet; API keys and account connections live in their own
// menus (Integrations, Connections) instead of being crammed in here.
export default function SettingsPage() {
  return (
    <div>
      <PageTitle className="mb-1">Settings</PageTitle>
      <p className="text-ink-3 text-[13px]">Nothing here yet.</p>
    </div>
  );
}
