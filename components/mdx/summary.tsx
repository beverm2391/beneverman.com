// Lead card for a post: a short abstract plus key links, sits above the first
// heading. Exactly one per post. Distinct from `Callout` — this is the opener,
// not an inline aside.
export function Summary({ children }: { children: React.ReactNode }) {
  return (
    <aside className="summary not-prose">
      <div className="summary-label">Summary</div>
      {children}
    </aside>
  );
}
