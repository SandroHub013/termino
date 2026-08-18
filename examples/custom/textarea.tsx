// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Textarea } from "../../lib/custom";

function App() {
  return (
    <box title="textarea demo" border style={{ width: 44, height: 12, padding: 1, flexDirection: "column" }}>
      <Textarea
        rows={4}
        placeholder="write a release note…"
        focused
        onChange={() => {
          // fire-and-forget: log or persist the new value here
        }}
      />
      <text fg="#565f89">ctrl-c quits · type, enter, arrows, backspace</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
