"use client";

import { useEffect, useRef, useState } from "react";
import { scrambleTo } from "@/lib/scramble";

/**
 * Text that decodes into its new value when `text` changes (e.g. language switch).
 * React renders only the initial text; later values are written imperatively.
 */
export function Scramble({ text, className, as: Tag = "span" }: { text: string; className?: string; as?: "span" | "div" }) {
  const [initial] = useState(text);
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (!ref.current) return;
    if (first.current) {
      first.current = false;
      if (ref.current.textContent !== text) ref.current.textContent = text;
      return;
    }
    scrambleTo(ref.current, text);
  }, [text]);
  return (
    <Tag ref={ref as never} className={className}>
      {initial}
    </Tag>
  );
}
