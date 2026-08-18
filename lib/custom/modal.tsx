import { createElement as h, useEffect, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import type { BoxRenderable } from "@opentui/core";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  borderColor?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 46,
  height = 10,
  borderColor = "#7aa2f7",
}: Readonly<ModalProps>) {
  const panelRef = useRef<BoxRenderable | null>(null);

  useKeyboard((key) => {
    if (!open) return;
    if (key.name === "escape" || key.name === "q") {
      onClose();
    }
  });

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return h(
    "box",
    {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(10,12,18,0.85)",
      },
    },
    h(
      "box",
      // eslint-disable-next-line react-hooks/refs -- ref via createElement wrapper
      {
        ref: panelRef,
        style: {
          width,
          height,
          border: true,
          borderStyle: "double",
          borderColor,
          backgroundColor: "#1a1b26",
          flexDirection: "column",
          paddingLeft: 1,
          paddingRight: 1,
          paddingTop: 0,
          paddingBottom: 1,
        },
      },
      title
        ? h(
            "box",
            { flexDirection: "row", justifyContent: "space-between", width: width - 4 },
            h("text", { fg: borderColor }, title),
            h("text", { fg: "#565f89" }, "esc"),
          )
        : null,
      h("box", { style: { flexGrow: 1, justifyContent: "center" } }, children),
    ),
  );
}
