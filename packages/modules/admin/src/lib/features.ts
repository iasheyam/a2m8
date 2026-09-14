export type FeatureId = "crm" | "voice-ai";

export type FeatureDef = {
  id: FeatureId;
  label: string;
  description: string;
};

export const FEATURES: FeatureDef[] = [
  { id: "crm", label: "CRM", description: "Contact records, notes and reminders." },
  { id: "voice-ai", label: "Voice AI", description: "Outbound AI calling campaigns." },
];
