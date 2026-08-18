"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { branchGlyph } from "@/lib/custom/tree-view";
import { TerminalScreen } from "../../terminal";

interface TNode {
  name: string;
  children?: TNode[];
}

const FILES: TNode[] = [
  {
    name: "src",
    children: [
      {
        name: "components",
        children: [{ name: "badge.tsx" }, { name: "tree-view.tsx" }, { name: "modal.tsx" }],
      },
      { name: "main.ts" },
      { name: "renderer.ts" },
    ],
  },
  { name: "package.json" },
  { name: "tsconfig.json" },
];

function rowColor(isSelected: boolean, expandable: boolean): string {
  if (isSelected) return C.yellow;
  return expandable ? C.cyan : "#a9b1d6";
}

interface Flat {
  node: TNode;
  path: string;
  depth: number;
  expandable: boolean;
}

function flatten(nodes: TNode[], expanded: Set<string>, depth: number, base: string, out: Flat[]) {
  for (const node of nodes) {
    const path = base ? `${base}/${node.name}` : node.name;
    const expandable = !!node.children?.length;
    out.push({ node, path, depth, expandable });
    if (expandable && expanded.has(path)) flatten(node.children!, expanded, depth + 1, path, out);
  }
}

function collectExpanded(nodes: TNode[], base = "", out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      const path = base ? `${base}/${node.name}` : node.name;
      out.push(path);
      collectExpanded(node.children, path, out);
    }
  }
  return out;
}

export function DemoTreeView() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(collectExpanded(FILES)));
  const [picked, setPicked] = useState<string | null>(null);
  const [focused, setFocused] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const flat: Flat[] = [];
  flatten(FILES, expanded, 0, "", flat);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    const item = flat[selected];
    if (e.key === "ArrowUp" || e.key === "k") setSelected((s) => Math.max(0, s - 1));
    else if (e.key === "ArrowDown" || e.key === "j") setSelected((s) => Math.min(flat.length - 1, s + 1));
    else if (e.key === "ArrowRight" || e.key === "l") {
      if (item?.expandable) setExpanded((prev) => new Set(prev).add(item.path));
    } else if (e.key === "ArrowLeft" || e.key === "h") {
      if (item?.expandable && expanded.has(item.path)) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.delete(item.path);
          return next;
        });
      } else if (item) {
        const parent = item.path.split("/").slice(0, -1).join("/");
        const idx = flat.findIndex((f) => f.path === parent);
        if (idx >= 0) setSelected(idx);
      }
    } else if (e.key === "Enter" && item) {
      if (item.expandable) {
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(item.path)) next.delete(item.path);
          else next.add(item.path);
          return next;
        });
      }
      setPicked(item.path);
    }
  };

  const rows: Screen["rows"] = flat.map((item, i) => {
    const isSel = focused && i === selected;
    const glyph = branchGlyph(item.expandable, expanded.has(item.path));
    const pad = " ".repeat(1 + item.depth * 2);
    const bg = isSel ? "#334455" : undefined;
    return R([
      { t: pad, bg },
      {
        t: `${glyph} ${item.node.name}`,
        fg: rowColor(isSel, item.expandable),
        bg,
      },
    ]);
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino tree-view", fg: C.muted },
        { t: " — focus, ↑↓←→", fg: C.dim, d: true },
      ]),
      R([]),
      ...rows,
      R([]),
      R([
        { t: "picked ", fg: C.dim },
        { t: picked ?? "—", fg: C.yellow },
      ]),
    ],
  };

  return (
    <div
      ref={ref}
      role="tree"
      aria-label="Tree view demo: arrow keys to walk the tree, enter to expand"
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
