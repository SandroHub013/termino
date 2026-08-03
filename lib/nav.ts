export interface NavComponent {
  slug: string;
  name: string;
  description: string;
  accent: string;
}

export interface NavSection {
  label: string;
  path: string;
  components: NavComponent[];
}

export const sections: NavSection[] = [
  {
    label: "layout",
    path: "components",
    components: [
      {
        slug: "text",
        name: "Text",
        description: "Styled text, colors, attributes, selection",
        accent: "text-term-blue",
      },
      {
        slug: "box",
        name: "Box",
        description: "Borders, titles, flex layout container",
        accent: "text-term-cyan",
      },
      {
        slug: "scrollbox",
        name: "ScrollBox",
        description: "Scrollable viewport with sticky scroll",
        accent: "text-term-teal",
      },
      {
        slug: "ascii-font",
        name: "ASCIIFont",
        description: "Large ASCII art text",
        accent: "text-term-magenta",
      },
    ],
  },
  {
    label: "input",
    path: "components",
    components: [
      {
        slug: "input",
        name: "Input",
        description: "Text field with cursor and focus states",
        accent: "text-term-green",
      },
      {
        slug: "select",
        name: "Select",
        description: "Keyboard-navigable option list",
        accent: "text-term-yellow",
      },
      {
        slug: "tab-select",
        name: "TabSelect",
        description: "Horizontal tab selection with scroll",
        accent: "text-term-red",
      },
    ],
  },
  {
    label: "code",
    path: "components",
    components: [
      {
        slug: "code",
        name: "Code",
        description: "Tree-sitter syntax highlighting",
        accent: "text-term-blue",
      },
      {
        slug: "diff",
        name: "Diff",
        description: "Unified and split diff viewer",
        accent: "text-term-green",
      },
    ],
  },
  {
    label: "data",
    path: "components",
    components: [
      {
        slug: "text-table",
        name: "TextTable",
        description: "Tabular data with borders",
        accent: "text-term-cyan",
      },
      {
        slug: "slider",
        name: "Slider",
        description: "Value picking with drag or keys",
        accent: "text-term-yellow",
      },
    ],
  },
];

export const allComponents = sections.flatMap((s) => s.components);

export const customSection: NavSection = {
  label: "custom",
  path: "custom",
  components: [
    {
      slug: "line-chart",
      name: "LineChart",
      description: "Multi-row line chart with gradient, reveal, crosshair",
      accent: "text-term-cyan",
    },
    {
      slug: "area-chart",
      name: "AreaChart",
      description: "Line chart with a stronger under-line gradient",
      accent: "text-term-teal",
    },
    {
      slug: "sparkline",
      name: "Sparkline",
      description: "Mini time-series chart with gradient fill and dot",
      accent: "text-term-green",
    },
    {
      slug: "progress-bar",
      name: "ProgressBar",
      description: "Animated progress bar with label and percentage",
      accent: "text-term-cyan",
    },
    {
      slug: "badge",
      name: "Badge",
      description: "Tone-colored status pill built from box + text",
      accent: "text-term-magenta",
    },
    {
      slug: "tree-view",
      name: "TreeView",
      description: "Keyboard-navigable tree with expand/collapse",
      accent: "text-term-yellow",
    },
    {
      slug: "toast",
      name: "Toast",
      description: "Toast provider with queue, tones, and auto-dismiss",
      accent: "text-term-red",
    },
    {
      slug: "modal",
      name: "Modal",
      description: "Dimmed overlay dialog with focus on the panel",
      accent: "text-term-blue",
    },
    {
      slug: "grid",
      name: "Grid",
      description: "Flexbox rows of equal-width cells",
      accent: "text-term-teal",
    },
    {
      slug: "divider",
      name: "Divider",
      description: "Horizontal rule with optional label",
      accent: "text-term-cyan",
    },
    {
      slug: "textarea",
      name: "Textarea",
      description: "Multiline text input with cursor and wrap",
      accent: "text-term-green",
    },
    {
      slug: "qrcode",
      name: "QRCode",
      description: "QR code rendered from real bytes",
      accent: "text-term-yellow",
    },
    {
      slug: "bar-chart",
      name: "BarChart",
      description: "Vertical bars with gridlines, value and category labels",
      accent: "text-term-cyan",
    },
    {
      slug: "pie-chart",
      name: "PieChart",
      description: "Solid disc colored by share with legend",
      accent: "text-term-magenta",
    },
    {
      slug: "ring-chart",
      name: "RingChart",
      description: "Donut with a centered total and legend",
      accent: "text-term-teal",
    },
    {
      slug: "gauge",
      name: "Gauge",
      description: "Semicircle arc with warn/danger zones and needle",
      accent: "text-term-green",
    },
    {
      slug: "heatmap",
      name: "Heatmap",
      description: "Background-colored matrix with labels and legend",
      accent: "text-term-yellow",
    },
    {
      slug: "candlestick",
      name: "CandlestickChart",
      description: "OHLC candles with wicks, up/down colors and labels",
      accent: "text-term-red",
    },
    {
      slug: "scatter",
      name: "ScatterChart",
      description: "Multi-series dot plot with gridlines and legend",
      accent: "text-term-blue",
    },
    {
      slug: "funnel",
      name: "FunnelChart",
      description: "Centered shrinking bars with gradient and percent",
      accent: "text-term-red",
    },
    {
      slug: "agent-spinner",
      name: "AgentSpinner",
      description: "Neomorphic status line with spinner and elapsed timer",
      accent: "text-term-green",
    },
    {
      slug: "status-bar",
      name: "StatusBar",
      description: "Agent bottom bar: mode, model, task, clock, tokens",
      accent: "text-term-blue",
    },
    {
      slug: "tool-call",
      name: "ToolCall",
      description: "Invocation card with state glyph, args and duration",
      accent: "text-term-magenta",
    },
    {
      slug: "approval-prompt",
      name: "ApprovalPrompt",
      description: "Permission dialog with keyboard yes/no selection",
      accent: "text-term-yellow",
    },
    {
      slug: "token-meter",
      name: "TokenMeter",
      description: "Context window usage with zone colors and io stats",
      accent: "text-term-red",
    },
    {
      slug: "step-list",
      name: "StepList",
      description: "Session plan tracker: pending → running → done",
      accent: "text-term-cyan",
    },
  ],
};
