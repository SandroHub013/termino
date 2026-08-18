import { createElement as h, createContext, useContext, useCallback, useEffect, useState } from "react";
import { useTimeline } from "@opentui/react";

export interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: "info" | "success" | "warning" | "error";
  duration: number;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  push: () => 0,
  dismiss: () => {},
});

export function useToasts() {
  return useContext(ToastContext);
}

const TONES = {
  info: { fg: "#7dcfff", bg: "#1f3a3a", glyph: "ℹ" },
  success: { fg: "#9ece6a", bg: "#1f3a2e", glyph: "✓" },
  warning: { fg: "#e0af68", bg: "#3a2e1f", glyph: "!" },
  error: { fg: "#f7768e", bg: "#3a1f28", glyph: "✗" },
} as const;

let nextId = 1;

const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => {
      const id = nextId++;
      const duration = toast.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toast, id, duration }]);
      timers.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  return h(
    ToastContext.Provider,
    { value: { push, dismiss } },
    children,
    h(ToastViewport, { toasts }),
  );
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return h(
    "box",
    { position: "absolute", right: 0, top: 0, flexDirection: "column", gap: 1 },
    toasts.map((toast) => h(ToastCard, { key: toast.id, toast })),
  );
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const tone = TONES[toast.tone];
  const [pct, setPct] = useState(100);

  const timeline = useTimeline({
    duration: toast.duration,
    autoplay: true,
  });

  useEffect(() => {
    timeline.add(
      { pct: 100 },
      {
        pct: 0,
        duration: toast.duration,
        ease: "linear",
        onUpdate: (a) => setPct(a.targets[0].pct as number),
      },
      0,
    );
  }, [timeline, toast.duration]);

  return h(
    "box",
    {
      style: {
        width: 40,
        border: true,
        borderColor: tone.fg,
        backgroundColor: "#16161e",
        paddingLeft: 1,
        paddingRight: 1,
        flexDirection: "column",
      },
    },
    h(
      "box",
      { flexDirection: "row", justifyContent: "space-between", width: 38 },
      h(
        "text",
        { fg: tone.fg },
        `${tone.glyph} ${toast.title}`,
      ),
      h("text", { fg: "#565f89" }, "esc"),
    ),
    toast.message ? h("text", { fg: "#a9b1d6" }, toast.message) : null,
    h("box", { style: { height: 1, marginTop: 1, backgroundColor: "#2f3449" } },
      h("box", {
        style: {
          width: Math.round((pct / 100) * 38),
          height: 1,
          backgroundColor: tone.fg,
        },
      }),
    ),
  );
}
