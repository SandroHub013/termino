// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
  AgentSpinner,
  ApprovalPrompt,
  AreaChart,
  Badge,
  BarChart,
  CandlestickChart,
  Divider,
  FunnelChart,
  Gauge,
  Grid,
  Heatmap,
  LineChart,
  Modal,
  PieChart,
  ProgressBar,
  QRCode,
  RingChart,
  ScatterChart,
  Sparkline,
  StatusBar,
  StepList,
  Textarea,
  TokenMeter,
  ToolCall,
  TreeView,
  TreeNode,
} from "../../lib/custom";

const TREE_NODES: TreeNode[] = [
  {
    name: "src",
    children: [
      {
        name: "agents",
        children: [
          { name: "agent-spinner.tsx" },
          { name: "status-bar.tsx" },
          { name: "tool-call.tsx" },
          { name: "approval-prompt.tsx" },
        ],
      },
      {
        name: "charts",
        children: [
          { name: "area-chart.tsx" },
          { name: "bar-chart.tsx" },
          { name: "gauge.tsx" },
          { name: "heatmap.tsx" },
        ],
      },
    ],
  },
  { name: "package.json" },
  { name: "README.md" },
];

export function App() {
  const [tab, setTab] = useState<number>(0);
  const [approvalAnswer, setApprovalAnswer] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Live dynamic state
  const [tokenUsed, setTokenUsed] = useState(48200);
  const [gaugeVal, setGaugeVal] = useState(68);
  const [sparkData, setSparkData] = useState<number[]>([12, 18, 25, 22, 35, 48, 62, 58, 70, 85, 78, 92]);
  const [textInput, setTextInput] = useState("Type in this TUI textarea!");
  const [selectedFile, setSelectedFile] = useState("agent-spinner.tsx");
  const [editing, setEditing] = useState(true);

  // Tabs with a widget that owns the arrow keys (approval select, tree nav, editor)
  const arrowsOwned = tab === 0 || tab === 3 || (tab === 4 && editing);

  const goToTab = (next: number) => {
    setTab(next);
    if (next === 4) setEditing(true);
  };

  // Keyboard navigation
  useKeyboard((key) => {
    if (modalOpen) {
      if (key.name === "escape" || key.name === "m") {
        setModalOpen(false);
      }
      return;
    }

    // While the textarea is focused it owns every key (including q/m/digits);
    // [esc] blurs it and hands control back to global navigation.
    if (tab === 4 && editing) {
      if (key.name === "escape") setEditing(false);
      return;
    }

    if (key.name === "q") {
      process.exit(0);
    }
    if (key.name === "m") {
      setModalOpen(true);
    }
    if (key.name === "1") goToTab(0);
    if (key.name === "2") goToTab(1);
    if (key.name === "3") goToTab(2);
    if (key.name === "4") goToTab(3);
    if (key.name === "5") goToTab(4);

    if (key.name === "right" && !arrowsOwned) {
      goToTab((tab + 1) % 5);
    }
    if (key.name === "left" && !arrowsOwned) {
      goToTab((tab - 1 + 5) % 5);
    }
    if (tab === 4 && !editing && key.name === "return") {
      setEditing(true);
    }
  });

  // Live background ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenUsed((prev) => (prev >= 180000 ? 10000 : prev + 1200));
      setGaugeVal(Math.round(50 + Math.sin(Date.now() / 800) * 35));
      setSparkData((prev) => [
        ...prev.slice(1),
        Math.max(10, Math.round(50 + Math.sin(Date.now() / 400) * 35 + Math.random() * 15)),
      ]);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const tabTitles = [
    "1. 🤖 Agents",
    "2. 📈 Core Charts",
    "3. 📊 Advanced Charts",
    "4. 🎛️ Controls",
    "5. ⚙️ Interactive",
  ];

  return (
    <box style={{ flexDirection: "column", gap: 1, padding: 1, width: 84 }}>
      {/* Header Title */}
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg="#7aa2f7">✦ TERMINO TUI COMPONENT GALLERY</text>
        <text fg="#565f89">20+ @opentui/react components demo</text>
      </box>

      {/* Tabs Header */}
      <box style={{ flexDirection: "row", gap: 1 }}>
        {tabTitles.map((title, idx) => (
          <box
            key={idx}
            style={{
              paddingLeft: 1,
              paddingRight: 1,
              backgroundColor: tab === idx ? "#7aa2f7" : "#1f2335",
            }}
          >
            <text fg={tab === idx ? "#15161e" : "#a9b1d6"}>{title}</text>
          </box>
        ))}
      </box>

      <Divider label={`viewing tab ${tab + 1}`} />

      {/* Tab 0: Agentic CLI Kit */}
      {tab === 0 && (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <box style={{ flexDirection: "column", gap: 1, width: 50 }}>
              <AgentSpinner label="refactoring codebase" sub="AST pass" running={true} color="#a5d98f" />
              <ToolCall
                name="execute_command"
                args='{ cmd: "npm run build" }'
                state="done"
                durationMs={342}
                output={["✔ Compiled successfully", "  Output: ./dist/index.js (42kb)"]}
                defaultExpanded={true}
                focused={false}
              />
              <ToolCall
                name="fetch_context"
                args='{ query: "opentui" }'
                state="running"
                focused={false}
              />
            </box>

            <box style={{ flexDirection: "column", gap: 1, width: 30 }}>
              <TokenMeter used={tokenUsed} total={200000} input={34100} output={14100} cached={8200} width={26} />
              <StepList
                title="⚡ Plan Execution"
                steps={[
                  { label: "Parse CLI arguments", state: "done" },
                  { label: "Load opentui components", state: "done" },
                  { label: "Render TUI interface", state: "running" },
                  { label: "Listen for user input", state: "pending" },
                ]}
              />
            </box>
          </box>

          <ApprovalPrompt
            title="exec_tool approval"
            message="run `git commit -m 'feat: complete TUI component gallery'`?"
            focused={!modalOpen}
            onAnswer={(allow) => setApprovalAnswer(allow ? "ALLOWED" : "DENIED")}
          />
          {approvalAnswer && (
            <text fg={approvalAnswer === "ALLOWED" ? "#9ece6a" : "#f7768e"}>
              User permission answer: {approvalAnswer}
            </text>
          )}
        </box>
      )}

      {/* Tab 1: Core Charts */}
      {tab === 1 && (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#7aa2f7">📈 AreaChart & LineChart</text>
              <AreaChart data={sparkData} width={42} height={6} color="#7aa2f7" fill="#1f2335" title="requests" />
              <LineChart data={sparkData} width={42} height={5} color="#9ece6a" title="latency" />
            </box>

            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#9ece6a">⏱ Gauge & Sparkline</text>
              <Gauge value={gaugeVal} min={0} max={100} width={24} height={6} label="Load" />
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#565f89">trend:</text>
                <Sparkline data={sparkData} width={26} fg="#e0af68" />
              </box>
            </box>
          </box>
        </box>
      )}

      {/* Tab 2: Advanced Charts */}
      {tab === 2 && (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#e0af68">📊 Bar & Funnel Charts</text>
              <BarChart
                data={[
                  { label: "React", value: 85, color: "#7aa2f7" },
                  { label: "TUI", value: 92, color: "#9ece6a" },
                  { label: "Core", value: 64, color: "#e0af68" },
                  { label: "MDX", value: 45, color: "#bb9af7" },
                ]}
                width={38}
                height={6}
                showValues
              />
              <FunnelChart
                stages={[
                  { label: "Visits", value: 1000 },
                  { label: "Downloads", value: 620 },
                  { label: "Installs", value: 410 },
                ]}
                width={38}
                showPercent
              />
            </box>

            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#bb9af7">🍩 Pie, Ring & Candlestick</text>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <PieChart
                  data={[
                    { label: "TS", value: 50, color: "#7aa2f7" },
                    { label: "JS", value: 30, color: "#e0af68" },
                    { label: "CSS", value: 20, color: "#bb9af7" },
                  ]}
                  width={14}
                  height={6}
                  legend={false}
                />
                <RingChart
                  data={[
                    { label: "OK", value: 80, color: "#9ece6a" },
                    { label: "Err", value: 20, color: "#f7768e" },
                  ]}
                  width={14}
                  height={6}
                  center="80%"
                  legend={false}
                />
              </box>
              <text fg="#7dcfff">Candlestick (OHLC)</text>
              <CandlestickChart
                data={[
                  { open: 10, high: 15, low: 8, close: 14 },
                  { open: 14, high: 18, low: 12, close: 11 },
                  { open: 11, high: 16, low: 10, close: 15 },
                  { open: 15, high: 19, low: 14, close: 18 },
                ]}
                width={36}
                height={5}
              />
            </box>
          </box>

          <text fg="#e0af68">🔥 Heatmap & Scatter</text>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <Heatmap
              data={[
                [1, 4, 7, 9],
                [3, 8, 2, 5],
                [6, 2, 9, 4],
              ]}
              rowLabels={["Mon", "Tue", "Wed"]}
              colLabels={["9a", "12p", "3p", "6p"]}
              cellWidth={3}
            />
            <ScatterChart
              series={[
                {
                  label: "Cluster A",
                  color: "#7aa2f7",
                  points: [
                    { x: 10, y: 20 },
                    { x: 30, y: 40 },
                    { x: 50, y: 70 },
                  ],
                },
              ]}
              width={34}
              height={5}
            />
          </box>
        </box>
      )}

      {/* Tab 3: Controls & Display */}
      {tab === 3 && (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <box style={{ flexDirection: "column", gap: 1, width: 38 }}>
              <text fg="#7aa2f7">📁 TreeView Explorer</text>
              <box border borderStyle="rounded" style={{ padding: 1 }}>
                <TreeView
                  nodes={TREE_NODES}
                  focused={!modalOpen}
                  onSelect={(node) => setSelectedFile(node.name)}
                />
              </box>
              <text fg="#565f89">Selected node: {selectedFile}</text>
            </box>

            <box style={{ flexDirection: "column", gap: 1, width: 40 }}>
              <text fg="#9ece6a">🏷️ Badges & ProgressBars</text>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <Badge label="ACTIVE" tone="green" />
                <Badge label="WARN" tone="yellow" />
                <Badge label="ERR" tone="red" />
                <Badge label="INFO" tone="cyan" />
              </box>

              <ProgressBar value={78} width={36} label="Build bundle..." color="#7aa2f7" />
              <ProgressBar value={45} width={36} label="Optimize assets..." color="#bb9af7" />

              <text fg="#e0af68">📱 QRCode Component</text>
              <QRCode value="https://sandrohub013.github.io/termino/" />
            </box>
          </box>
        </box>
      )}

      {/* Tab 4: Interactive & Layout */}
      {tab === 4 && (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7">✏️ Interactive Textarea Input</text>
          <Textarea
            defaultValue={textInput}
            onChange={setTextInput}
            placeholder="Type anything here..."
            rows={3}
            focused={!modalOpen && editing}
          />
          <text fg="#565f89">
            {editing
              ? "Editor focused — [esc] blur to use global keys"
              : "Editor blurred — [enter] focus · [1-5/←/→] tabs"}
            {" · "}Character count: {textInput.length}
          </text>

          <Divider label="grid card layout" />
          <Grid columns={3} gap={1}>
            <box border borderStyle="rounded" style={{ padding: 1 }}>
              <text fg="#7aa2f7">Card 1: Status OK</text>
            </box>
            <box border borderStyle="rounded" style={{ padding: 1 }}>
              <text fg="#9ece6a">Card 2: 99.9% Uptime</text>
            </box>
            <box border borderStyle="rounded" style={{ padding: 1 }}>
              <text fg="#e0af68">Card 3: 4 Workers</text>
            </box>
          </Grid>
          <text fg="#bb9af7">Press [m] to open/close Modal overlay demo</text>
        </box>
      )}

      {/* Bottom Status Bar */}
      <StatusBar
        mode="SHOWCASE"
        model="termino/opentui"
        task={tabTitles[tab]}
        time={new Date().toTimeString().slice(0, 5)}
        tokens={`${(tokenUsed / 1000).toFixed(1)}k ctx`}
        running={true}
        width={82}
      />

      {/* Navigation Footer */}
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg="#565f89">
          [1-5] Tabs · [←/→] Tabs (when free) · [m] Modal · [q] Quit
        </text>
      </box>

      {/* Modal Overlay Component */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="⚡ Termino TUI Modal" width={48} height={8}>
        <box style={{ flexDirection: "column", gap: 1, padding: 1 }}>
          <text fg="#9ece6a">This is a floating TUI Modal dialog!</text>
          <text fg="#565f89">Press [esc] or [m] to close this modal.</text>
        </box>
      </Modal>
    </box>
  );
}

async function main() {
  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

// `main` is a bun-ism; the file is executed via `bun examples/custom/cli-showcase.tsx`
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  main().catch(console.error);
}
