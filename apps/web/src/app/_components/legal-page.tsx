import Link from "next/link";
import { PageTitle, MetaText } from "@a2m8/ui";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
        >
          ← a2m8.ai
        </Link>

        <PageTitle className="mt-6 mb-2">{title}</PageTitle>
        <MetaText className="block mb-10">Last updated {updated}</MetaText>

        <div
          className="text-[14px] text-ink-2 leading-relaxed
            [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:uppercase
            [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-line-2
            [&_h2]:first:mt-0
            [&_p]:mb-3
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
            [&_a]:text-pine [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-pine-2"
        >
          {children}
        </div>

        <div className="mt-16 pt-6 border-t border-line flex gap-4">
          <Link
            href="/terms"
            className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
          >
            Privacy
          </Link>
        </div>
      </div>
    </main>
  );
}
