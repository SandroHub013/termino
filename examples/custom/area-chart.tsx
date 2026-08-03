// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useEffect, useState } from "react";
import { AreaChart } from "../../lib/custom";

function App() {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 80 }, (_, i) => 30 + Math.sin(i / 6) * 15 + (i % 11) * 3),
  );
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const loadTimer = setTimeout(() => setLoading(false), 1800);
    const dataTimer = setInterval(() => {
      setData((prev) => [...prev.slice(1), 30 + Math.sin(Date.now() / 400) * 15 + Math.random() * 8]);
    }, 250);
    return () => {
      clearTimeout(loadTimer);
      clearInterval(dataTimer);
    };
  }, []);

  return (
    <box border title="area-chart" style={{ padding: 1, flexDirection: "column", gap: 1 }}>
      <AreaChart
        data={data}
        width={60}
        height={10}
        color="#bb9af7"
        fill="#292e42"
        title="requests/min"
        loading={loading}
        crosshair
        selected={selected}
        onSelect={setSelected}
        format={(v) => `${v.toFixed(0)} req`}
      />
      <text fg="#565f89">←/→ crosshair · shimmer on boot · ctrl+c to exit</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
