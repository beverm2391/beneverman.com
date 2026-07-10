// Inline aside for the body of a post: notes, tips, warnings, update notes.
// `type` picks the accent colour + default label; `title` overrides the label.
type CalloutType = "note" | "tip" | "warn" | "error";

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  warn: "Warning",
  error: "Caution"
};

export function Callout({
  type = "note",
  title,
  children
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="callout not-prose" data-callout={type}>
      <div className="callout-label">{title ?? CALLOUT_LABELS[type]}</div>
      {children}
    </aside>
  );
}
