"use client";

import { useState } from "react";

export function LogoMark({
  label,
  domain,
  className = "w-10 h-10",
}: {
  label: string;
  /** Fetches the real logo for this domain; falls back to a monogram on error. */
  domain?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://api.companyenrich.com/logo/${domain}`}
        alt={`${label} logo`}
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded object-contain bg-card border border-line`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded bg-sunken border border-line font-display font-semibold text-ink ${className}`}
    >
      {label.charAt(0).toUpperCase()}
    </div>
  );
}
