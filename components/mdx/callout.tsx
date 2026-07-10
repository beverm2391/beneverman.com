import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Inline aside for the body of a post, rendered with the Coss Alert. `type`
// picks the variant + icon + default label; `title` overrides the label.
type CalloutType = "note" | "tip" | "warn" | "error";

const CALLOUTS: Record<
  CalloutType,
  {
    label: string;
    variant: "info" | "success" | "warning" | "error";
    Icon: typeof Info;
  }
> = {
  // GitHub-callout convention: Note is the blue/info one.
  note: { label: "Note", variant: "info", Icon: Info },
  tip: { label: "Tip", variant: "success", Icon: Lightbulb },
  warn: { label: "Warning", variant: "warning", Icon: TriangleAlert },
  error: { label: "Caution", variant: "error", Icon: OctagonAlert }
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
  const { label, variant, Icon } = CALLOUTS[type];
  return (
    <Alert variant={variant} className="not-prose my-[1.6rem]">
      <Icon />
      <AlertTitle>{title ?? label}</AlertTitle>
      <AlertDescription
        className={[
          // MDX children arrive as p/ul/ol; restore list + link styling that
          // not-prose stripped.
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-[1.2rem] [&_ol]:pl-[1.2rem]",
          "[&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2"
        ].join(" ")}
      >
        {children}
      </AlertDescription>
    </Alert>
  );
}
