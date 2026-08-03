import { TerminalWindow } from "./terminal";

export interface Prop {
  name: string;
  type: string;
  default: string;
  description: string;
}

export function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="rounded-md border border-ink-600 overflow-hidden my-6">
      <div className="px-3 h-8 bg-ink-800 border-b border-ink-600 flex items-center text-[11px] uppercase tracking-wider text-term-cyan">
        properties
      </div>
      <div className="overflow-x-auto term-scroll">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-ink-400 border-b border-ink-600">
              <th className="px-3 py-2 font-medium">prop</th>
              <th className="px-3 py-2 font-medium">type</th>
              <th className="px-3 py-2 font-medium">default</th>
              <th className="px-3 py-2 font-medium">description</th>
            </tr>
          </thead>
          <tbody className="text-ink-200">
            {props.map((p) => (
              <tr
                key={p.name}
                className="border-b border-ink-700/60 last:border-0 hover:bg-ink-800/60 transition-colors"
              >
                <td className="px-3 py-2 text-term-yellow whitespace-nowrap">
                  {p.name}
                </td>
                <td className="px-3 py-2 text-term-blue whitespace-nowrap">
                  {p.type}
                </td>
                <td className="px-3 py-2 text-ink-400 whitespace-nowrap">
                  {p.default}
                </td>
                <td className="px-3 py-2 text-ink-300">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KeyTable({ keys }: { keys: [string, string][] }) {
  return (
    <TerminalWindow title="keymap" className="my-6">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
        {keys.map(([k, action]) => (
          <div key={k} className="contents">
            <span className="text-term-yellow bg-ink-700 rounded-sm px-1.5 py-0.5 text-[12px] font-semibold">
              {k}
            </span>
            <span className="text-ink-200">{action}</span>
          </div>
        ))}
      </div>
    </TerminalWindow>
  );
}
