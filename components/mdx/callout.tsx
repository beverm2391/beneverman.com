// Inline aside for the body of a post: notes, tips, warnings, update notes.
// `type` picks the accent colour + default label; `title` overrides the label.
// The accent is data-driven, so it's set as a CSS var inline and the border /
// tint / label all reference it via Tailwind arbitrary values.
type CalloutType = "note" | "tip" | "warn" | "error";

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  warn: "Warning",
  error: "Caution"
};

const CALLOUT_ACCENTS: Record<CalloutType, string> = {
  note: "var(--muted)",
  tip: "#4f8a5b",
  warn: "#b7791f",
  error: "#b4472e"
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
    <aside
      style={{ ["--callout-accent" as string]: CALLOUT_ACCENTS[type] }}
      className={[
        "not-prose my-[1.6rem] rounded-r-lg border-l-[3px] px-4 py-[0.7rem]",
        "border-[color:var(--callout-accent)] bg-[color-mix(in_srgb,var(--callout-accent)_7%,transparent)]",
        "[&_p]:mt-[0.4rem] [&_ul]:mt-[0.4rem] [&_ol]:mt-[0.4rem] [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-[1.2rem] [&_ol]:pl-[1.2rem]",
        "[&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2"
      ].join(" ")}
    >
      <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[color:var(--callout-accent)]">
        {title ?? CALLOUT_LABELS[type]}
      </div>
      {children}
    </aside>
  );
}
