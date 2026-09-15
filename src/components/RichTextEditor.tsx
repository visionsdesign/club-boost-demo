"use client";

import { useEffect, useRef } from "react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  }

  function handleLink() {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }

  const isEmpty = !value || value === "<br>" || value === "<p><br></p>";

  return (
    <div>
      <div className="rte-toolbar flex gap-1.5 bg-ink-2 border border-[var(--line)] rounded-t-[10px] p-1.5">
        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          • List
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
          1. List
        </ToolbarButton>
        <ToolbarButton label="Add link" onClick={handleLink}>
          Link
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" onClick={() => exec("removeFormat")}>
          Clear
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="rte-editor"
        data-empty={isEmpty}
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
      />
    </div>
  );
}
