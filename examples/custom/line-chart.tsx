// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useEffect, useState } from "react";
import { AreaChart, LineChart, Sparkline } from "../../lib/custom";

function App() {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 60 }, (_, i) => 50 + Math.sin(i / 4) * 20 + Math.random() * 10),
  );
  const [reveal, setReveal] = useState(0);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prev) => [...prev.slice(1), 50 + Math.sin(Date.now() / 300) * 20 + Math.random() * 10]);
      setReveal((r) => Math.min(1, r + 0.05));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <box border style={{ padding: 1, flexDirection: "column", gap: 1 }}>
      <AreaChart
        data={data}
        width={52}
        height={8}
        color="#7dcfff"
        title="cpu load"
        reveal={reveal}
      />
      <LineChart
        data={data}
        width={52}
        height={6}
        color="#9ece6a"
        title="memory"
        crosshair
        selected={selected}
        onSelect={setSelected}
      />
      <box flexDirection="row" gap={1}>
        <text fg="#565f89">net </text>
        <Sparkline data={data} width={46} fg="#bb9af7" />
      </box>
      <text fg="#565f89">←/→ crosshair · ctrl+c to exit</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
