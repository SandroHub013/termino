import { createElement as h } from "react";
import { Canvas } from "./canvas";
import { mixColor, clamp, type CursorCell } from "./chart";

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
}: SankeyFlowProps) {
  if (flows.length === 0) return null;

  // Extract unique sources and targets
  const sources = Array.from(new Set(flows.map((f) => f.source)));
  const targets = Array.from(new Set(flows.map((f) => f.target)));

  // Calculate totals
  const sourceTotals: Record<string, number> = {};
  const targetTotals: Record<string, number> = {};
  let totalVolume = 0;

  for (const f of flows) {
    sourceTotals[f.source] = (sourceTotals[f.source] || 0) + f.value;
    targetTotals[f.target] = (targetTotals[f.target] || 0) + f.value;
    totalVolume += f.value;
  }

  const palette = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

  const colW = Math.floor((width - 12) / 2);
  const flowBridgeW = width - (colW * 2);

  const rows: CursorCell[][] = [];

  // Header row
  const header: CursorCell[] = [];
  const titleStr = ` ${title} `;
  for (let i = 0; i < width; i++) {
    if (i < titleStr.length) {
      header.push({ ch: titleStr[i] ?? " ", fg: "#f9fafb" });
    } else {
      header.push({ ch: " ", fg: "#374151" });
    }
  }
  rows.push(header);

  // Column titles row
  const subHeader: CursorCell[] = [];
  for (let i = 0; i < width; i++) {
    if (i < sourceTitle.length) {
      subHeader.push({ ch: sourceTitle[i] ?? " ", fg: "#9ca3af" });
    } else if (i >= width - targetTitle.length) {
      const idx = i - (width - targetTitle.length);
      subHeader.push({ ch: targetTitle[idx] || " ", fg: "#9ca3af" });
    } else {
      subHeader.push({ ch: " ", fg: "#1f2937" });
    }
  }
  rows.push(subHeader);

  // Render flow rows
  const maxRows = Math.max(sources.length, targets.length, flows.length);

  for (let r = 0; r < maxRows; r++) {
    const row: CursorCell[] = [];

    // Left Node (Source)
    const srcName = sources[r];
    const srcVal = srcName ? sourceTotals[srcName] : null;
    const srcPct = srcVal ? ((srcVal / totalVolume) * 100).toFixed(0) : "";
    const srcColor = palette[r % palette.length];

    let leftStr = "";
    if (srcName) {
      leftStr = `[█] ${srcName} ($${srcVal}k - ${srcPct}%)`;
    }

    for (let c = 0; c < colW; c++) {
      if (srcName && c < 3) {
        row.push({ ch: c === 1 ? "█" : " ", fg: srcColor });
      } else if (srcName && c >= 4 && c - 4 < leftStr.length - 4) {
        row.push({ ch: leftStr[c] || " ", fg: "#e5e7eb" });
      } else {
        row.push({ ch: " ", fg: "#374151" });
      }
    }

    // Bridge / Flow lines
    const flow = flows[r];
    const flowColor = flow?.color || palette[r % palette.length] || "#7dcfff";
    const flowPct = flow ? ((flow.value / totalVolume) * 100).toFixed(0) : "";

    for (let b = 0; b < flowBridgeW; b++) {
      if (!flow) {
        row.push({ ch: " ", fg: "#1f2937" });
      } else {
        const isHead = b === flowBridgeW - 1;
        const isMid = b === Math.floor(flowBridgeW / 2);
        if (isHead) {
          row.push({ ch: "▶", fg: flowColor });
        } else if (isMid && flowBridgeW > 6) {
          const tag = `${flowPct}%`;
          row.push({ ch: tag[0] ?? "═", fg: "#f3f4f6" });
        } else {
          row.push({ ch: "═", fg: mixColor(flowColor, "#1f2937", 0.3) });
        }
      }
    }

    // Right Node (Target)
    const tgtName = targets[r];
    const tgtVal = tgtName ? targetTotals[tgtName] : null;
    const tgtPct = tgtVal ? ((tgtVal / totalVolume) * 100).toFixed(0) : "";
    const tgtColor = palette[(r + 2) % palette.length];

    let rightStr = "";
    if (tgtName) {
      rightStr = `${tgtName} ($${tgtVal}k - ${tgtPct}%) [█]`;
    }

    for (let c = 0; c < colW; c++) {
      const charIdx = c;
      if (tgtName && charIdx < rightStr.length - 4) {
        row.push({ ch: rightStr[charIdx] || " ", fg: "#e5e7eb" });
      } else if (tgtName && c >= colW - 3) {
        row.push({ ch: c === colW - 2 ? "█" : " ", fg: tgtColor });
      } else {
        row.push({ ch: " ", fg: "#374151" });
      }
    }

    rows.push(row);
  }

  return h(Canvas, { rows, width });
}
