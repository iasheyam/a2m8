type Status = "pine" | "amber" | "red";

const STATUS_CLASSES: Record<Status, string> = {
  pine: "bg-pine-soft text-pine",
  amber: "bg-amber-soft text-amber",
  red: "bg-red-soft text-red",
};

export function StatusPill({ status, children }: { status: Status; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[status]}`}
    >
      {children}
    </span>
  );
}
