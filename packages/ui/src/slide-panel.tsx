import type { ReactNode } from "react";
import { XIcon } from "./icons";

export function SlidePanel({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-ink/40 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-line shadow-lg flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-line shrink-0">
          <h2 className="font-display text-xl font-semibold uppercase text-ink truncate">{title}</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors shrink-0 ml-3">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="p-4 border-t border-line shrink-0 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
