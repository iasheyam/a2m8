import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper">
      <p className="font-mono text-[13px] text-ink-3">Coming soon.</p>
      <div className="flex gap-4">
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
    </main>
  );
}
