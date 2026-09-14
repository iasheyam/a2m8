import { XIcon } from "./icons";

export function Chip({
  active,
  children,
  onClick,
  onRemove,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "bg-ink border-ink text-white"
          : "bg-card border-line text-ink-2 hover:border-ink-3"
      }`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </Comp>
  );
}
