// The blog's paper background: a fixed gradient wash + grain overlay. Rendered
// by the content layout only, so the home scene stays clean. Styling + the
// ?debug-tunable grain vars live in globals.css (.paper-wash / .paper-grain).
export function PaperBackground() {
  return (
    <>
      <div className="paper-wash" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
    </>
  );
}
