"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
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

/** Marker at the head of a row: a caret that points down when the branch is
 *  open and right when it is closed, or a dot for a leaf. Deliberately a copy
 *  of the one in `lib/custom/tree-view`: importing it would pull @opentui/react
 *  into the browser bundle, and OpenTUI has no browser build. */
function branchGlyph(expandable: boolean, isExpanded: boolean): string {
  if (!expandable) return "·";
  return isExpanded ? "▾" : "▸";
}

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

  const expand = (path: string) => setExpanded((prev) => new Set(prev).add(path));

  const collapse = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });

  /** Left on an open branch closes it; anywhere else it walks to the parent. */
  const goLeft = (item: Flat | undefined) => {
    if (!item) return;
    if (item.expandable && expanded.has(item.path)) {
      collapse(item.path);
      return;
    }
    const parent = item.path.split("/").slice(0, -1).join("/");
    const idx = flat.findIndex((f) => f.path === parent);
    if (idx >= 0) setSelected(idx);
  };

  const activate = (item: Flat) => {
    if (item.expandable) {
      if (expanded.has(item.path)) collapse(item.path);
      else expand(item.path);
    }
    setPicked(item.path);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    const item = flat[selected];
    switch (e.key) {
      case "ArrowUp":
      case "k":
        return setSelected((s) => Math.max(0, s - 1));
      case "ArrowDown":
      case "j":
        return setSelected((s) => Math.min(flat.length - 1, s + 1));
      case "ArrowRight":
      case "l":
        if (item?.expandable) expand(item.path);
        return;
      case "ArrowLeft":
      case "h":
        return goLeft(item);
      case "Enter":
        if (item) activate(item);
        return;
      default:
        return;
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
