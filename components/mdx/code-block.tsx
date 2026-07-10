"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

// Every MDX code block renders through this (registered as `pre` in the
// mdxComponents map): the highlighted pre, plus a copy button that fades in
// on hover and confirms with a check for a moment.
export function CodeBlock(props: React.ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="group relative">
      <pre ref={preRef} {...props} />
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute top-2 right-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-bg text-muted opacity-0 transition-opacity duration-150 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
