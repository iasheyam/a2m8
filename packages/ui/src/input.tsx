import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-card border border-line rounded-sm px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-pine transition-colors ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`bg-card border border-line rounded-sm px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-pine transition-colors ${className}`}
    />
  );
}
