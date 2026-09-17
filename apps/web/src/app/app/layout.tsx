"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MetaText,
} from "@a2m8/ui";
import { getEnabledFeatures, subscribeToFeatureFlags, type FeatureId } from "@a2m8/module-admin";

type NavItem = { href: string; label: string; abbr: string };
type NavSection = { label: string; featureId?: FeatureId; items: NavItem[] };

const featureSections: NavSection[] = [
  {
    label: "CRM",
    featureId: "crm",
    items: [
      { href: "/app/crm/contacts", label: "Contacts", abbr: "Co" },
    ],
  },
  {
    label: "Voice AI",
    featureId: "voice-ai",
    items: [
      { href: "/app/voice-ai/leads",     label: "Leads",     abbr: "Le" },
      { href: "/app/voice-ai/campaigns", label: "Campaigns", abbr: "Ca" },
      { href: "/app/voice-ai/calls",     label: "Calls",     abbr: "Cl" },
    ],
  },
];

// Cross-cutting sections — not product feature modules, always visible
// regardless of which feature modules are enabled for an org. Rendered
// below the feature sections, in this order, with Accounts last.

// Always visible — this is the panel that controls the feature toggles
// above, so it can never be switched off from within itself.
const adminSection: NavSection = {
  label: "Admin",
  items: [
    { href: "/app/admin/features", label: "Features", abbr: "Fe" },
  ],
};

const accountsSection: NavSection = {
  label: "Accounts",
  items: [
    { href: "/app/settings", label: "Settings", abbr: "S" },
    { href: "/app/connections", label: "Connections", abbr: "Cn" },
    { href: "/app/integrations", label: "Integrations", abbr: "In" },
  ],
};

const bottomSections = [adminSection, accountsSection];
const allSections = [...featureSections, ...bottomSections];

function activeLabel(pathname: string): string {
  for (const section of allSections) {
    const item = section.items.find((i) => pathname.startsWith(i.href));
    if (item) return `${section.label} / ${item.label}`;
  }
  return "";
}

function NavSectionBlock({
  section,
  collapsed,
  open,
  onToggle,
  pathname,
}: {
  section: NavSection;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 mb-1.5 text-xs font-semibold text-ink-3 hover:text-white uppercase tracking-wider transition-colors"
        >
          <span>{section.label}</span>
          {open ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
        </button>
      )}
      {open && (
        <div className="space-y-0.5">
          {section.items.map(({ href, label, abbr }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center rounded-sm text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
                } ${
                  active
                    ? "bg-pine text-white"
                    : "text-ink-3 hover:text-white hover:bg-white/5"
                }`}
              >
                {collapsed ? abbr : label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<Set<FeatureId>>(
    () => new Set(getEnabledFeatures())
  );
  const [openSections, setOpenSections] = useState<Set<string>>(
    () =>
      new Set(
        allSections
          .filter((section) => section.items.some((item) => pathname.startsWith(item.href)))
          .map((section) => section.label)
      )
  );

  useEffect(() => {
    const refresh = () => setEnabledFeatures(new Set(getEnabledFeatures()));
    refresh();
    return subscribeToFeatureFlags(refresh);
  }, []);

  function toggleSection(label: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  const visibleFeatureSections = featureSections.filter(
    (section) => !section.featureId || enabledFeatures.has(section.featureId)
  );

  return (
    <div className="flex min-h-screen bg-paper">
      <aside
        className={`fixed inset-y-0 left-0 flex flex-col bg-ink transition-all duration-200 ${
          collapsed ? "w-14" : "w-[236px]"
        }`}
      >
        <div
          className={`flex items-center h-[60px] border-b border-white/10 ${
            collapsed ? "justify-center px-0" : "justify-between px-5"
          }`}
        >
          {!collapsed && (
            <span className="font-display text-lg font-semibold uppercase tracking-wide text-white">
              a2m8.ai
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-ink-3 hover:text-white transition-colors p-1 rounded-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 flex flex-col px-2 py-4 overflow-y-auto">
          {visibleFeatureSections.map((section) => (
            <NavSectionBlock
              key={section.label}
              section={section}
              collapsed={collapsed}
              open={collapsed || openSections.has(section.label)}
              onToggle={() => toggleSection(section.label)}
              pathname={pathname}
            />
          ))}

          <div className="mt-auto pt-4 border-t border-white/10">
            {bottomSections.map((section) => (
              <NavSectionBlock
                key={section.label}
                section={section}
                collapsed={collapsed}
                open={collapsed || openSections.has(section.label)}
                onToggle={() => toggleSection(section.label)}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>
      </aside>

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? "ml-14" : "ml-[236px]"
        }`}
      >
        <header className="h-[60px] shrink-0 bg-card border-b border-line flex items-center px-6">
          <MetaText>{activeLabel(pathname)}</MetaText>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
