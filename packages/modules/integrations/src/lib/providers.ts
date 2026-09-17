// The registry of integration providers this app can connect to. Each entry
// here is purely descriptive for the UI right now — there's no backend yet
// to actually hold a connection, so every provider reads as "Not Connected"
// until the OAuth flow and integration_connections table exist.
export type Provider = {
  id: string;
  name: string;
  description: string;
  domain: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: "microsoft",
    name: "Microsoft Account",
    description: "Sync mail and calendar from a Microsoft 365 account.",
    domain: "microsoft.com",
  },
];
