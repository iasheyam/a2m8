import type { ApiKeyCredentials } from "./api-keys";

export type CredentialField = {
  key: keyof ApiKeyCredentials;
  label: string;
  /** Cosmetic fields (like a display name) don't count toward "Active". */
  required?: boolean;
};

export type ApiIntegration = {
  id: string;
  name: string;
  description: string;
  domain: string;
  fields: CredentialField[];
};

export const API_INTEGRATIONS: ApiIntegration[] = [
  {
    id: "vapi",
    name: "Vapi",
    description: "Powers outbound AI voice calls.",
    domain: "vapi.ai",
    fields: [
      { key: "agentName", label: "Agent Name", required: false },
      { key: "vapiApiKey", label: "API Key" },
      { key: "vapiPhoneNumberId", label: "Phone Number ID" },
      { key: "vapiAssistantId", label: "Assistant ID" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Model calls for extraction and Q&A.",
    domain: "anthropic.com",
    fields: [
      { key: "anthropicApiKey", label: "API Key" },
    ],
  },
];

export function isIntegrationActive(integration: ApiIntegration, values: ApiKeyCredentials): boolean {
  return integration.fields
    .filter((f) => f.required !== false)
    .every((f) => values[f.key].trim().length > 0);
}
