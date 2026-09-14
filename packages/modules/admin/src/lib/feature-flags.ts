import { FEATURES, type FeatureId } from "./features";

const KEY = "a2m8_feature_flags";
const CHANGE_EVENT = "a2m8:feature-flags-changed";

// Every feature ships enabled today. Toggling one off only hides it from the
// nav — it does not block direct navigation to its routes. Full entitlement
// gating (blocking the route itself, per-plan) is deferred; see CLAUDE.md.
const DEFAULT_ENABLED: FeatureId[] = FEATURES.map((f) => f.id);

export function getEnabledFeatures(): FeatureId[] {
  if (typeof window === "undefined") return DEFAULT_ENABLED;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FeatureId[]) : DEFAULT_ENABLED;
  } catch {
    return DEFAULT_ENABLED;
  }
}

export function setFeatureEnabled(id: FeatureId, enabled: boolean): void {
  const current = new Set(getEnabledFeatures());
  if (enabled) {
    current.add(id);
  } else {
    current.delete(id);
  }
  localStorage.setItem(KEY, JSON.stringify([...current]));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Nav (in apps/web) needs to react immediately when a flag changes, even
// without a route change — e.g. toggling a feature off while sitting on the
// Features page itself.
export function subscribeToFeatureFlags(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
