import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import path from "path";
import { customComponents, orderedCustomComponents } from "@/lib/custom/meta";
import { TerminalWindow } from "@/components/terminal";
import { CodeBlock } from "@/components/code-block";
import { PropsTable, KeyTable } from "@/components/docs";
import { DemoLineChart, DemoAreaChart } from "@/components/demos/custom/demo-line-chart";
import { DemoProgressBar } from "@/components/demos/custom/demo-progress-bar";
import { DemoSparkline } from "@/components/demos/custom/demo-sparkline";
import { DemoBadge } from "@/components/demos/custom/demo-badge";
import { DemoTreerView } from "@/components/demos/custom/demo-tree-view";
import { DemoToast } from "@/components/demos/custom/demo-toast";
import { DemoModal } from "@/components/demos/custom/demo-modal";
import { DemoGrid } from "@/components/demos/custom/demo-grid";
import { DemoDivider } from "@/components/demos/custom/demo-divider";
import { DemoTextarea } from "@/components/demos/custom/demo-textarea";
import { DemoQRCode } from "@/components/demos/custom/demo-qrcode";
import { DemoBarChart } from "@/components/demos/custom/demo-bar-chart";
import { DemoPieChart } from "@/components/demos/custom/demo-pie-chart";
import { DemoRingChart } from "@/components/demos/custom/demo-ring-chart";
import { DemoGauge } from "@/components/demos/custom/demo-gauge";
import { DemoHeatmap } from "@/components/demos/custom/demo-heatmap";
import { DemoCandlestick } from "@/components/demos/custom/demo-candlestick";
import { DemoScatter } from "@/components/demos/custom/demo-scatter";
import { DemoFunnel } from "@/components/demos/custom/demo-funnel";
import { DemoAgentSpinner } from "@/components/demos/custom/demo-agent-spinner";
import { DemoStatusBar } from "@/components/demos/custom/demo-status-bar";
import { DemoToolCall } from "@/components/demos/custom/demo-tool-call";
import { DemoApprovalPrompt } from "@/components/demos/custom/demo-approval-prompt";
import { DemoTokenMeter } from "@/components/demos/custom/demo-token-meter";
import { DemoStepList } from "@/components/demos/custom/demo-step-list";

const DEMOS: Record<string, React.ComponentType<{ variant?: string }>> = {
  LineChart: DemoLineChart,
  AreaChart: DemoAreaChart,
  ProgressBar: DemoProgressBar,
  Sparkline: DemoSparkline,
  Badge: DemoBadge,
  TreeView: DemoTreerView,
  Toast: DemoToast,
  Modal: DemoModal,
  Grid: DemoGrid,
  Divider: DemoDivider,
  Textarea: DemoTextarea,
  QRCode: DemoQRCode,
  BarChart: DemoBarChart,
  PieChart: DemoPieChart,
  RingChart: DemoRingChart,
  Gauge: DemoGauge,
  Heatmap: DemoHeatmap,
  Candlestick: DemoCandlestick,
  Scatter: DemoScatter,
  Funnel: DemoFunnel,
  AgentSpinner: DemoAgentSpinner,
  StatusBar: DemoStatusBar,
  ToolCall: DemoToolCall,
  ApprovalPrompt: DemoApprovalPrompt,
  TokenMeter: DemoTokenMeter,
  StepList: DemoStepList,
};

export function generateStaticParams() {
  return customComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = customComponents.find((c) => c.slug === slug);
  return {
    title: `${meta?.name ?? "Custom"} — Termino`,
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = customComponents.find((c) => c.slug === slug);
  if (!meta) notFound();

  const idx = orderedCustomComponents.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? orderedCustomComponents[idx - 1] : null;
  const next = idx < orderedCustomComponents.length - 1 ? orderedCustomComponents[idx + 1] : null;

  const sourcePath = path.join(process.cwd(), "lib", "custom", meta.source);
  let source = "";
  try {
    source = readFileSync(sourcePath, "utf8");
  } catch {
    source = `// could not read ${meta.source}`;
  }

  const Demo = DEMOS[meta.demo as keyof typeof DEMOS];

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <div className="text-[12px] text-ink-400 mb-6 flex items-center gap-1.5">
        <Link href="/docs/custom" className="hover:text-ink-100 transition-colors">
          ~/docs
        </Link>
        <span>/custom/</span>
        <span className="text-term-magenta">{slug}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-ink-050 mb-2 flex items-center gap-3">
        <span className="text-term-green select-none">▚</span>
        {meta.name}
        <span className="text-[11px] text-term-magenta border border-ink-600 rounded-sm px-1.5 py-0.5">
          custom
        </span>
      </h1>
      <p className="text-[13.5px] text-ink-200 mb-8">{meta.description}</p>

      <TerminalWindow title={`custom/${slug}`} right={<span className="text-term-green text-[11px]">live</span>}>
        <Demo />
      </TerminalWindow>

      {meta.variants && meta.variants.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
            <span className="text-term-cyan select-none">##</span>
            Variants
          </h2>
          <div className="space-y-6">
            {meta.variants.map((v) => (
              <div key={v.id}>
                <div className="text-[12.5px] text-ink-300 mb-2">
                  <span className="text-term-yellow font-medium">{v.label}</span>
                  <span className="text-ink-500"> · {v.blurb}</span>
                </div>
                <TerminalWindow title={`custom/${slug} · ${v.id}`}>
                  <Demo variant={v.id} />
                </TerminalWindow>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
        <span className="text-term-cyan select-none">##</span>
        API
      </h2>
      <p className="text-[13.5px] text-ink-200 my-3">{meta.api}</p>

      <PropsTable props={meta.props} />

      <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
        <span className="text-term-cyan select-none">##</span>
        Keymap
      </h2>
      <KeyTable keys={meta.keymap} />

      {meta.notes.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
            <span className="text-term-cyan select-none">##</span>
            Notes
          </h2>
          <ul className="my-3 space-y-1.5 text-[13.5px] text-ink-200">
            {meta.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-term-green select-none shrink-0">▸</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
        <span className="text-term-cyan select-none">##</span>
        Source
      </h2>
      <p className="text-[13.5px] text-ink-200 my-3">
        Real implementation — this is the code that runs in your terminal.
      </p>
      <CodeBlock title={meta.source} lang="tsx" code={source} />

      <div className="mt-14 flex items-stretch gap-3 border-t border-ink-700 pt-6">
        {prev && (
          <Link
            href={`/docs/custom/${prev.slug}`}
            className="t-card group flex-1 rounded-md border border-ink-600 p-3 hover:border-ink-400 transition-colors"
          >
            <div className="text-[11px] text-ink-400 group-hover:text-ink-300">← {prev.name}</div>
            <div className="text-[13px] text-ink-200 group-hover:text-ink-050 mt-0.5">
              {prev.description}
            </div>
          </Link>
        )}
        {next && (
          <Link
            href={`/docs/custom/${next.slug}`}
            className="t-card group flex-1 rounded-md border border-ink-600 p-3 text-right hover:border-ink-400 transition-colors"
          >
            <div className="text-[11px] text-ink-400 group-hover:text-ink-300">{next.name} →</div>
            <div className="text-[13px] text-ink-200 group-hover:text-ink-050 mt-0.5">
              {next.description}
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
