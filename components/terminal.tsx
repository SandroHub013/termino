import { Screen } from "@/lib/term";
import { cellStyle } from "@/lib/term";

export function TerminalScreen({
  screen,
  className = "",
}: {
  screen: Screen;
  className?: string;
}) {
  return (
    <div className={["bg-[#16161e] rounded-md overflow-hidden", className].join(" ")}>
      <div className="font-mono text-[13px] leading-[1.35]">
        {screen.rows.map((row, i) => (
          <div key={i} className="flex whitespace-pre">
            {row.map((seg, j) => (
              <span key={j} style={cellStyle(seg)}>
                {seg.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TerminalWindow({
  title,
  children,
  right,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-md border border-ink-600 bg-[#12141f] shadow-[0_0_40px_rgba(122,162,247,0.07)] term-scanline relative overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 px-3 h-9 border-b border-ink-600 bg-ink-800">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-term-red/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-term-yellow/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-term-green/80" />
        </div>
        <span className="text-[12px] text-ink-400 mx-auto">
          <span className="text-term-cyan">~/</span>
          {title}
        </span>
        <div className="ml-auto min-w-[24px]">{right}</div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
