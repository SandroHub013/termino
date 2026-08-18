import { createElement as h, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";

export interface TreeNode {
  name: string;
  value?: string;
  children?: TreeNode[];
}

export interface TreeViewProps {
  nodes: TreeNode[];
  focused?: boolean;
  onSelect?: (node: TreeNode, path: string) => void;
  indent?: number;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
}

interface FlatNode {
  node: TreeNode;
  path: string;
  depth: number;
  expandable: boolean;
}

/** Marker at the head of a row: a caret that points down when the branch is
 *  open and right when it is closed, or a dot for a leaf. */
export function branchGlyph(expandable: boolean, isExpanded: boolean): string {
  if (!expandable) return "·";
  return isExpanded ? "▾" : "▸";
}

/** Row text colour: the selection colour wins, branches read brighter than
 *  leaves. */
function rowColor(isSelected: boolean, expandable: boolean, selectedColor: string): string {
  if (isSelected) return selectedColor;
  return expandable ? "#7dcfff" : "#a9b1d6";
}

function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth: number,
  base: string,
  out: FlatNode[],
) {
  for (const node of nodes) {
    const path = base ? `${base}/${node.name}` : node.name;
    const expandable = !!node.children?.length;
    out.push({ node, path, depth, expandable });
    if (expandable && expanded.has(path)) {
      flatten(node.children!, expanded, depth + 1, path, out);
    }
  }
}

export function TreeView({
  nodes,
  focused = true,
  onSelect,
  indent = 2,
  selectedBackgroundColor = "#334455",
  selectedTextColor = "#e0af68",
}: Readonly<TreeViewProps>) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(collectExpanded(nodes)),
  );

  const flat = useMemo(() => {
    const out: FlatNode[] = [];
    flatten(nodes, expanded, 0, "", out);
    return out;
  }, [nodes, expanded]);

  useKeyboard((key) => {
    if (!focused) return;
    if (key.name === "up" || key.name === "k") {
      setSelected((s) => Math.max(0, s - 1));
    } else if (key.name === "down" || key.name === "j") {
      setSelected((s) => Math.min(flat.length - 1, s + 1));
    } else if (key.name === "right" || key.name === "l") {
      const item = flat[selected];
      if (item?.expandable) setExpanded((prev) => new Set(prev).add(item.path));
    } else if (key.name === "left" || key.name === "h") {
      const item = flat[selected];
      if (item?.expandable && expanded.has(item.path)) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.delete(item.path);
          return next;
        });
      } else {
        const parent = parentPath(item?.path);
        if (parent) {
          const idx = flat.findIndex((f) => f.path === parent);
          if (idx >= 0) setSelected(idx);
        }
      }
    } else if (key.name === "return" && flat[selected]) {
      const item = flat[selected];
      if (item.expandable) {
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(item.path)) next.delete(item.path);
          else next.add(item.path);
          return next;
        });
      }
      onSelect?.(item.node, item.path);
    }
  });

  return h(
    "box",
    { flexDirection: "column" },
    flat.map((item, i) => {
      const isSel = focused && i === selected;
      const glyph = branchGlyph(item.expandable, expanded.has(item.path));
      return h(
        "box",
        {
          key: item.path,
          style: {
            paddingLeft: 1 + item.depth * indent,
            backgroundColor: isSel ? selectedBackgroundColor : undefined,
          },
        },
        h(
          "text",
          {
            fg: rowColor(isSel, item.expandable, selectedTextColor),
          },
          `${glyph} ${item.node.name}`,
        ),
      );
    }),
  );
}

function collectExpanded(nodes: TreeNode[], base = "", out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      const path = base ? `${base}/${node.name}` : node.name;
      out.push(path);
      collectExpanded(node.children, path, out);
    }
  }
  return out;
}

function parentPath(path?: string): string | null {
  if (!path) return null;
  const idx = path.lastIndexOf("/");
  return idx > 0 ? path.slice(0, idx) : null;
}
