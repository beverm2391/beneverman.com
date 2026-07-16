// The site's paper background: flat --bg with a static grain overlay.
// Rendered by the homepage and the content layout. Styling + the
// ?debug-tunable grain vars live in globals.css (.paper-grain). A gradient
// wash layer was removed (2026-07) — see the globals.css comment.
export function PaperBackground() {
  return <div className="paper-grain" aria-hidden="true" />;
}
