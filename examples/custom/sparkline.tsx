// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useEffect, useState } from "react";
import { Sparkline, Badge } from "../../lib/custom";

function App() {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 24 }, () => 40 + Math.random() * 40),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prev) => [...prev.slice(-40), 30 + Math.random() * 70]);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <box title="live metrics" border style={{ padding: 2, flexDirection: "column", gap: 1 }}>
      <box flexDirection="row" gap={1}>
        <Badge label="cpu" tone="cyan" />
        <Badge label="live" tone="green" prefix="● " />
      </box>
      <Sparkline data={data} width={40} fg="#7dcfff" />
      <text fg="#565f89">press ctrl+c to exit</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
