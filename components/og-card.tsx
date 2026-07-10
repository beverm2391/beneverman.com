export function OgCard({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        alignItems: "flex-start",
        background: "#f2f0ee",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 82px",
        width: "100%"
      }}
    >
      <div style={{ color: "rgba(23,23,23,.55)", display: "flex", fontSize: 26 }}>{eyebrow}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 980 }}>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ color: "rgba(23,23,23,.68)", display: "flex", fontSize: 31, lineHeight: 1.35 }}>
          {description}
        </div>
      </div>
      <div style={{ color: "rgba(23,23,23,.5)", display: "flex", fontSize: 24 }}>beneverman.com</div>
    </div>
  );
}
