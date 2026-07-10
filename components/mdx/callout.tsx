// Bespoke aside for MDX posts: summary cards, tips, warnings, update notes.
// One component covers all of them; `label` sets the small mono header.
export function Callout({
  label,
  children
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="callout">
      {label ? <div className="callout-label">{label}</div> : null}
      {children}
    </aside>
  );
}
