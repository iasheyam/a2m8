import type { Campaign } from "../types/campaign";

const KEY = "a2m8_campaigns";

export function getCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Campaign[]) : [];
  } catch {
    return [];
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(campaigns));
}

export function getCampaign(id: string): Campaign | undefined {
  return getCampaigns().find((c) => c.id === id);
}

export function updateCampaign(updated: Campaign): void {
  saveCampaigns(getCampaigns().map((c) => (c.id === updated.id ? updated : c)));
}

export function deleteCampaign(id: string): void {
  saveCampaigns(getCampaigns().filter((c) => c.id !== id));
}
