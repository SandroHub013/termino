import { createElement as h } from "react";
import { Canvas } from "./canvas";
import { mixColor, type CursorCell } from "./chart";

export interface SankeyFlowLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyFlowProps {
  flows: SankeyFlowLink[];
  width?: number;
  title?: string;
  sourceTitle?: string;
  targetTitle?: string;
}

export function SankeyFlow({
  flows,
  width = 64,
  title = "Resource & Revenue Flow",
  sourceTitle = "SOURCES",
  targetTitle = "ALLOCATIONS",
}: Readonly<SankeyFlowProps>) {
  if (flows.length === 0) return null;

  const sources = Array.from(new Set(flows.map((f) => f.source)));
  const targets = Array.from(new Set(flows.map((f) => f.target)));
  const totals = flowTotals(flows);

  const colW = Math.floor((width - 12) / 2);
  const bridgeW = width - colW * 2;

  const rows: CursorCell[][] = [
    titleRow(` ${title} `, width),
    columnTitleRow(sourceTitle, targetTitle, width),
  ];

  const maxRows = Math.max(sources.length, targets.length, flows.length);
  for (let r = 0; r < maxRows; r++) {
    const srcName = sources[r];
    const srcVal = srcName ? totals.bySource[srcName] : null;
    const tgtName = targets[r];
    const tgtVal = tgtName ? totals.byTarget[tgtName] : null;
    const flow = flows[r];

    rows.push([
      ...sourceCells(
        srcName,
        srcName ? `[█] ${srcName} ($${srcVal}k - ${share(srcVal, totals.volume)}%)` : "",
        PALETTE[r % PALETTE.length],
        colW,
      ),
      ...bridgeCells(
        flow,
        bridgeW,
        flow?.color || PALETTE[r % PALETTE.length] || "#7dcfff",
        flow ? ((flow.value / totals.volume) * 100).toFixed(0) : "",
      ),
      ...targetCells(
        tgtName,
        tgtName ? `${tgtName} ($${tgtVal}k - ${share(tgtVal, totals.volume)}%) [█]` : "",
        PALETTE[(r + 2) % PALETTE.length],
        colW,
      ),
    ]);
  }

  return h(Canvas, { rows, width });
}

const PALETTE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

interface FlowTotals {
  bySource: Record<string, number>;
  byTarget: Record<string, number>;
  volume: number;
}

function flowTotals(flows: SankeyFlowLink[]): FlowTotals {
  const bySource: Record<string, number> = {};
  const byTarget: Record<string, number> = {};
  let volume = 0;
  for (const f of flows) {
    bySource[f.source] = (bySource[f.source] || 0) + f.value;
    byTarget[f.target] = (byTarget[f.target] || 0) + f.value;
    volume += f.value;
  }
  return { bySource, byTarget, volume };
}

/** A node's share of the total, rounded, or blank when it carries nothing. */
const share = (value: number | null | undefined, volume: number): string =>
  value ? ((value / volume) * 100).toFixed(0) : "";

function titleRow(text: string, width: number): CursorCell[] {
  return Array.from({ length: width }, (_, i) =>
    i < text.length ? { ch: text[i] ?? " ", fg: "#f9fafb" } : { ch: " ", fg: "#374151" },
  );
}

/** Column headings pushed to opposite edges of the diagram. */
function columnTitleRow(sourceTitle: string, targetTitle: string, width: number): CursorCell[] {
  const targetStart = width - targetTitle.length;
  return Array.from({ length: width }, (_, i) => {
    if (i < sourceTitle.length) return { ch: sourceTitle[i] ?? " ", fg: "#9ca3af" };
    if (i >= targetStart) return { ch: targetTitle[i - targetStart] || " ", fg: "#9ca3af" };
    return { ch: " ", fg: "#1f2937" };
  });
}

/** Source side: a colour swatch in the first three columns, then the label. */
function sourceCells(
  name: string | undefined,
  label: string,
  color: string | undefined,
  colW: number,
): CursorCell[] {
  return Array.from({ length: colW }, (_, c) => {
    if (!name) return { ch: " ", fg: "#374151" };
    if (c < 3) return { ch: c === 1 ? "█" : " ", fg: color };
    if (c >= 4 && c - 4 < label.length - 4) return { ch: label[c] || " ", fg: "#e5e7eb" };
    return { ch: " ", fg: "#374151" };
  });
}

/** Target side: the label first, with the swatch against the right edge. */
function targetCells(
  name: string | undefined,
  label: string,
  color: string | undefined,
  colW: number,
): CursorCell[] {
  return Array.from({ length: colW }, (_, c) => {
    if (!name) return { ch: " ", fg: "#374151" };
    if (c < label.length - 4) return { ch: label[c] || " ", fg: "#e5e7eb" };
    if (c >= colW - 3) return { ch: c === colW - 2 ? "█" : " ", fg: color };
    return { ch: " ", fg: "#374151" };
  });
}

/** The rule between the two columns: an arrowhead at the target end and, on a
 *  wide enough bridge, the flow's share sitting in the middle. */
function bridgeCells(
  flow: SankeyFlowLink | undefined,
  bridgeW: number,
  color: string,
  pct: string,
): CursorCell[] {
  return Array.from({ length: bridgeW }, (_, b) => {
    if (!flow) return { ch: " ", fg: "#1f2937" };
    if (b === bridgeW - 1) return { ch: "▶", fg: color };
    if (b === Math.floor(bridgeW / 2) && bridgeW > 6) {
      return { ch: `${pct}%`[0] ?? "═", fg: "#f3f4f6" };
    }
    return { ch: "═", fg: mixColor(color, "#1f2937", 0.3) };
  });
}
