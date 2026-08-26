"use client";

import { useState } from "react";

export default function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <input readOnly className="field-input text-xs" value={value} onFocus={(e) => e.target.select()} />
      <button type="button" onClick={copy} className="btn btn-outline text-xs py-2! px-3!">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
