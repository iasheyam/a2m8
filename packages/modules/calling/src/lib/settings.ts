const KEY = "a2m8_settings";

export type Settings = {
  vapiApiKey: string;
  vapiPhoneNumberId: string;
  vapiAssistantId: string;
  agentName: string;
};

const defaults: Settings = {
  vapiApiKey: "",
  vapiPhoneNumberId: "",
  vapiAssistantId: "",
  agentName: "",
};

export function getSettings(): Settings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
