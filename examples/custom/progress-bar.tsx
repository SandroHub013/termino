// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useEffect, useState } from "react";
import { ProgressBar } from "../../lib/custom";

function App() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  return (
    <box title="deploy" border style={{ padding: 2, flexDirection: "column", gap: 1 }}>
      <ProgressBar label="build" value={value} color="#7dcfff" />
      <ProgressBar label="push" value={Math.min(100, value * 0.8)} color="#9ece6a" />
      <ProgressBar label="deploy" value={Math.min(100, value * 0.6)} color="#bb9af7" />
      <text fg="#565f89">press ctrl+c to exit</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
