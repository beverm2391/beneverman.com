// Lead card for a post: a short abstract plus key links, sits above the first
// heading. Exactly one per post. Distinct from `Callout` — this is the opener,
// not an inline aside. `not-prose` keeps the typography plugin off its children;
// child styles (lists, links) are set with arbitrary variants since the body
// comes from MDX.
export function Summary({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className={[
        "not-prose mt-[1.6rem] mb-[2.4rem] rounded-lg border border-border px-[1.2rem] py-4",
        "[&_p]:mt-2 [&_ul]:mt-2 [&_ol]:mt-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-[1.2rem] [&_ol]:pl-[1.2rem]",
        "[&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2",
        // Inline-code chips, mirroring the .prose code look (not-prose keeps
        // the prose rules out, so the card owns this itself).
        "[&_code]:rounded-[4px] [&_code]:bg-code-bg [&_code]:px-[0.35em] [&_code]:py-[0.15em] [&_code]:font-mono [&_code]:text-[0.9em]"
      ].join(" ")}
    >
      <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-muted">Summary</div>
      {children}
    </aside>
  );
}
