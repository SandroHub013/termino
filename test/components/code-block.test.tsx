import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "@/components/code-block";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
});

describe("CodeBlock", () => {
  it("renders the code content", () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    expect(container.textContent).toContain("const x = 1;");
  });

  it("defaults the language label to ts", () => {
    render(<CodeBlock code="x" />);
    expect(screen.getByText("ts")).toBeInTheDocument();
  });

  it("renders an explicit language label", () => {
    render(<CodeBlock code="x" lang="tsx" />);
    expect(screen.getByText("tsx")).toBeInTheDocument();
  });

  it("omits the title when not given and renders it when given", () => {
    const { unmount } = render(<CodeBlock code="x" />);
    expect(screen.queryByText("example.tsx")).toBeNull();
    unmount();
    render(<CodeBlock code="x" title="example.tsx" />);
    expect(screen.getByText("example.tsx")).toBeInTheDocument();
  });

  it("numbers every line", () => {
    render(<CodeBlock code={"a\nb\nc"} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders a single line of empty code as one numbered row", () => {
    render(<CodeBlock code="" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).toBeNull();
  });

  it("syntax-highlights keywords", () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    const keyword = [...container.querySelectorAll("span")].find(
      (el) => el.textContent === "const",
    );
    expect(keyword).toBeDefined();
    // #bb9af7 — jsdom normalises inline colors to rgb()
    expect(keyword).toHaveStyle({ color: "rgb(187, 154, 247)" });
  });

  it("colors a string literal differently from a keyword", () => {
    const { container } = render(<CodeBlock code={'const s = "hi";'} />);
    const spans = [...container.querySelectorAll("span")];
    const keyword = spans.find((el) => el.textContent === "const");
    const literal = spans.find((el) => el.textContent === '"hi"');
    expect(literal).toBeDefined();
    expect(literal?.getAttribute("style")).not.toBe(keyword?.getAttribute("style"));
  });

  it("starts with the copy button in its idle state", () => {
    render(<CodeBlock code="x" />);
    expect(screen.getByRole("button", { name: "copy" })).toBeInTheDocument();
  });

  it("writes the code to the clipboard and confirms", async () => {
    render(<CodeBlock code="const x = 1;" />);
    fireEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(writeText).toHaveBeenCalledWith("const x = 1;");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /copied/ })).toBeInTheDocument(),
    );
  });

  it("reverts to the idle label after the confirmation delay", async () => {
    vi.useFakeTimers();
    try {
      render(<CodeBlock code="x" />);
      fireEvent.click(screen.getByRole("button", { name: "copy" }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByRole("button", { name: /copied/ })).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(1600);
      });
      expect(screen.getByRole("button", { name: "copy" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays in the idle state when the clipboard rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    writeText.mockRejectedValue(new Error("NotAllowedError"));
    render(<CodeBlock code="x" />);
    fireEvent.click(screen.getByRole("button", { name: "copy" }));
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "copy" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copied/ })).toBeNull();
    consoleError.mockRestore();
  });

  it("preserves indentation in the rendered code", () => {
    const { container } = render(<CodeBlock code={"function f() {\n  return 1;\n}"} />);
    expect(container.textContent).toContain("  return 1;");
  });
});
