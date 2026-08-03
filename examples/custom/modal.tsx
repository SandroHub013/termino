// @jsxImportSource @opentui/react
import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState } from "react";
import { Modal } from "../../lib/custom";

function App() {
  const [open, setOpen] = useState(false);

  useKeyboard((key) => {
    if (key.name === "space") setOpen((o) => !o);
  });

  return (
    <box title="modal demo" border style={{ width: 60, height: 16, padding: 2 }}>
      <text fg="#565f89">press space to open the modal</text>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete branch?"
        width={46}
        height={8}
      >
        <box flexDirection="column" gap={1}>
          <text fg="#a9b1d6">This will permanently delete main/feature-x</text>
          <text fg="#f7768e">press esc to cancel</text>
        </box>
      </Modal>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
