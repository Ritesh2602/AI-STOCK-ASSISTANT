"use client";
import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

type Props = { code: string };

export default function MermaidChart({ code }: Props) {
  const [svg, setSvg] = useState("");
  const id = useId().replace(/:/g, "_"); // mermaid id must be simple

  useEffect(() => {
    if (!code) return;

    // init mermaid on client only
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose", // allow links if any
      flowchart: { curve: "basis" },
    });

    let isCancelled = false;
    (async () => {
      try {
        const { svg } = await mermaid.render(id, code);
        if (!isCancelled) setSvg(svg);
      } catch (e) {
        console.error("Mermaid render failed:", e);
        setSvg("");
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [code, id]);

  if (!code || !svg) return null;
  return (
    <div
      className="rounded-lg overflow-hidden bg-gray-900"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
