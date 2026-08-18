// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Divider, Grid } from "../../lib/custom";

function Cell({ title, fg }: Readonly<{ title: string; fg: string }>) {
  return (
    <box border borderStyle="rounded" style={{ padding: 1, flexDirection: "column" }}>
      <text fg={fg}>{title}</text>
    </box>
  );
}

function App() {
  return (
    <box title="grid demo" border style={{ width: 60, height: 18, padding: 1, flexDirection: "column" }}>
      <text fg="#565f89">3 columns — every cell flexGrow: 1</text>
      <box style={{ flexGrow: 1 }}>
        <Grid columns={3} gap={1}>
          {[
            <Cell key="1" title="cpu" fg="#7aa2f7" />,
            <Cell key="2" title="mem" fg="#9ece6a" />,
            <Cell key="3" title="net" fg="#e0af68" />,
            <Cell key="4" title="io" fg="#bb9af7" />,
            <Cell key="5" title="temp" fg="#f7768e" />,
            <Cell key="6" title="swap" fg="#7dcfff" />,
          ]}
        </Grid>
      </box>
      <Divider label="legend" />
      <text fg="#565f89">rows always fill the width</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
