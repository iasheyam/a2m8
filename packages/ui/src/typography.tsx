import type { ReactNode } from "react";

export function PageTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`font-display text-[30px] font-semibold uppercase leading-none text-ink ${className}`}>
      {children}
    </h1>
  );
}

export function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-xl font-semibold uppercase leading-none text-ink ${className}`}>
      {children}
    </h2>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10.5px] font-semibold uppercase tracking-[.2em] text-ink-3 ${className}`}>
      {children}
    </p>
  );
}

export function MetaText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[10px] tracking-[.1em] text-ink-3 ${className}`}>
      {children}
    </span>
  );
}
