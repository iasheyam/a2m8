"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchSelect({ value, options, onChange, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  function select(option: string) {
    onChange(option);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={open ? query : value}
        placeholder={open ? "Search…" : (placeholder ?? "Type")}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setOpen(false); setQuery(""); }}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-ink text-[13px] px-2 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-pine hover:bg-sunken transition-colors placeholder:text-ink-3"
      />

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 top-full mt-0.5 z-30 w-52 max-h-56 overflow-y-auto bg-card border border-line rounded shadow-lg"
        >
          {filtered.map((o, i) => (
            <button
              key={o}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(o); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                i === highlighted
                  ? "bg-pine text-white"
                  : o === value
                  ? "bg-sunken text-ink"
                  : "text-ink-2 hover:bg-sunken"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
