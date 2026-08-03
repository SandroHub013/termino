// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useState } from "react";
import { TreeNode, TreeView } from "../../lib/custom";

const FILES: TreeNode[] = [
  {
    name: "src",
    children: [
      {
        name: "components",
        children: [
          { name: "badge.tsx" },
          { name: "tree-view.tsx" },
        ],
      },
      { name: "main.ts" },
      { name: "renderer.ts" },
    ],
  },
  {
    name: "package.json",
  },
  {
    name: "tsconfig.json",
  },
];

function App() {
  const [picked, setPicked] = useState("");

  return (
    <box title="file explorer" border style={{ width: 40, height: 14, padding: 1, flexDirection: "column" }}>
      <TreeView
        nodes={FILES}
        focused
        onSelect={(node, path) => setPicked(path)}
      />
      <text fg="#565f89">selected: {picked || "—"} (enter to pick)</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
