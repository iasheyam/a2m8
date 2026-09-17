const KEY = "a2m8_integration_api_keys";

// Bring-your-own-key credentials for third-party services this app calls on
// the user's behalf, as opposed to Connections (OAuth accounts a2m8 itself
// brokers). Anthropic isn't consumed anywhere yet — storage only, ready for
// when the model client lands.
export type ApiKeyCredentials = {
  agentName: string;
  vapiApiKey: string;
  vapiPhoneNumberId: string;
  vapiAssistantId: string;
  anthropicApiKey: string;
};

const defaults: ApiKeyCredentials = {
  agentName: "",
  vapiApiKey: "",
  vapiPhoneNumberId: "",
  vapiAssistantId: "",
  anthropicApiKey: "",
};

export function getApiKeyCredentials(): ApiKeyCredentials {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<ApiKeyCredentials>) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveApiKeyCredentials(values: ApiKeyCredentials): void {
  localStorage.setItem(KEY, JSON.stringify(values));
}
