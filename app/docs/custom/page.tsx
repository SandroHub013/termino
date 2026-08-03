import Link from "next/link";
import { customComponents } from "@/lib/custom/meta";
import { ComponentGallery } from "@/components/gallery";
import { CodeBlock } from "@/components/code-block";

export const metadata = {
  title: "Custom components — Termino",
};

const GROUP_LABEL: Record<string, string> = {
  charts: "charts",
  controls: "controls",
  layout: "layout",
  display: "display",
  agents: "agents",
};

export default function CustomIndex() {
  const groups = Object.entries(GROUP_LABEL).map(([key, label]) => ({
    label,
    items: customComponents
      .filter((c) => c.group === key)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        accent: c.accent,
      })),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="text-[12px] text-ink-400 mb-2">~/docs/custom</div>

      <div className="mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-ink-050 mb-3 flex items-center gap-3">
          <span className="text-term-magenta">▚</span>
          Custom components
        </h1>
        <p className="text-[13.5px] text-ink-200 max-w-2xl leading-relaxed">
          Built on <code className="text-term-yellow">@opentui/react</code> — composition
          over inheritance. No native code, no <code>extend()</code> ceremony: every
          component below is a plain function component using{" "}
          <code className="text-term-blue">&lt;box&gt;</code>,{" "}
          <code className="text-term-blue">&lt;text&gt;</code>, and the{" "}
          <code className="text-term-blue">useKeyboard</code> /{" "}
          <code className="text-term-blue">useTimeline</code> hooks. Source in{" "}
          <code className="text-term-green">lib/custom/</code>, runnable in{" "}
          <code className="text-term-green">examples/custom/</code>.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(GROUP_LABEL).map(([key, label]) => (
            <span
              key={key}
              className="t-chip text-[11px] px-2 py-1 rounded-sm border border-ink-600 text-ink-300"
            >
              {label}{" "}
              <span className="text-ink-500">
                {customComponents.filter((c) => c.group === key).length}
              </span>
            </span>
          ))}
        </div>
      </div>

      <ComponentGallery groups={groups} basePath="/docs/custom" accent="text-term-magenta" />

      <h2 className="text-lg font-bold text-ink-050 mt-12 mb-3 flex items-center gap-2">
        <span className="text-term-cyan select-none">##</span>
        Usage pattern
      </h2>
      <p className="text-[13.5px] text-ink-200 my-3">
        Components import like any React module. Stateful ones (Toast, Modal)
        expose context or props; presentational ones (Badge, Sparkline,
        ProgressBar) render from props only:
      </p>
      <CodeBlock
        title="app.tsx"
        lang="tsx"
        code={`import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { Badge, ProgressBar, ToastProvider } from "termino"

function App() {
  return (
    <box border title="dashboard" style={{ padding: 2, flexDirection: "column", gap: 1 }}>
      <box flexDirection="row" gap={1}>
        <Badge label="prod" tone="red" />
        <Badge label="ready" tone="green" prefix="● " />
      </box>
      <ProgressBar label="deploy" value={64} />
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
)`}
      />
      <p className="text-[13.5px] text-ink-200 my-3">
        Run any example in a real terminal:
      </p>
      <CodeBlock
        title="terminal"
        lang="bash"
        code={`$ bun examples/custom/tree-view.tsx     # keyboard tree
$ bun examples/custom/progress-bar.tsx # animated bars
$ bun examples/custom/toast.tsx        # space to push toasts`}
      />
      <div className="mt-10 flex flex-wrap gap-3">
        {customComponents.map((c) => (
          <Link
            key={c.slug}
            href={`/docs/custom/${c.slug}`}
            className="t-chip px-3 py-1.5 text-[12.5px] rounded-md border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
