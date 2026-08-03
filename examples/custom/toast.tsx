// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { ToastProvider, useToasts } from "../../lib/custom";

function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}

function Demo() {
  const { push } = useToasts();

  useKeyboard((key) => {
    if (key.name === "space") {
      const tones = ["info", "success", "warning", "error"] as const;
      const tone = tones[Math.floor(Math.random() * tones.length)];
      push({
        title: `deploy-${Date.now() % 1000}`,
        message: "release build finished",
        tone,
      });
    }
  });

  return (
    <box title="toast demo" border style={{ width: 60, height: 16, padding: 2 }}>
      <text fg="#565f89">press space to push a toast</text>
      <text fg="#565f89">press ctrl+c to exit</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
