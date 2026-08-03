// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Divider, QRCode } from "../../lib/custom";

function App() {
  return (
    <box
      title="qrcode demo"
      border
      style={{ width: 46, height: 30, padding: 1, flexDirection: "column" }}
    >
      <text fg="#565f89">scan me — real QR, no deps</text>
      <Divider label="https://opentui.com" />
      <box style={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
        <QRCode value="https://opentui.com" fg="#9ece6a" bg="#1a1b26" />
      </box>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
