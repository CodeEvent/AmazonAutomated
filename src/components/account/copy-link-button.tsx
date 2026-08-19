"use client";

import { useState } from "react";

export function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — nothing to fall back to in this context
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="shrink-0 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-ink/90"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
