// The favicon mark: a "B" in ink on the site's paper, rounded like a key cap.
// Rendered by app/icon.tsx (32px tab icon) and app/apple-icon.tsx (180px home
// screen) through the same next/og ImageResponse pipeline as the OG card, so
// the glyph and colors stay identical at every size. Colors are the dark
// theme's --bg/--fg from globals.css; favicons can't follow the visitor's
// color scheme, and Ben chose the dark mark as the default.
// The apple icon must stay full-bleed (rounded: false): iOS fills transparent
// pixels with black and applies its own corner mask.
export function Monogram({ size, rounded = true }: { size: number; rounded?: boolean }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#161616",
        borderRadius: rounded ? size * 0.22 : 0,
        color: "#f5f5f5",
        display: "flex",
        fontSize: size * 0.66,
        fontWeight: 600,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.02em",
        width: "100%"
      }}
    >
      B
    </div>
  );
}
