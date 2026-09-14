import type { ReactNode } from "react";

export function Card({
  title,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-card border border-line rounded ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-line-2">
          <h2 className="font-display text-[19px] font-semibold uppercase leading-none text-ink">
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={`p-[18px] ${bodyClassName}`}>{children}</div>
    </div>
  );
}
