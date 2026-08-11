import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TerminalScreen, TerminalWindow } from "@/components/terminal";
import { C, type Screen } from "@/lib/term";

const screenOf = (...rows: string[][]): Screen => ({
  rows: rows.map((row) => row.map((t) => ({ t }))),
});

describe("TerminalScreen", () => {
  it("renders one line per row and one span per segment", () => {
    const { container } = render(
      <TerminalScreen screen={screenOf(["a", "b"], ["c"])} />,
    );
    expect(container.querySelectorAll("span")).toHaveLength(3);
    expect(container.textContent).toBe("abc");
  });

  it("renders an empty screen without crashing", () => {
    const { container } = render(<TerminalScreen screen={{ rows: [] }} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
    expect(container.textContent).toBe("");
  });

  it("renders a row with no segments", () => {
    const { container } = render(<TerminalScreen screen={{ rows: [[]] }} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("applies the segment styles", () => {
    const { container } = render(
      <TerminalScreen
        screen={{
          rows: [[{ t: "x", fg: "#ff0000", bg: "#000000", b: true, u: true }]],
        }}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(span).toHaveStyle({ backgroundColor: "rgb(0, 0, 0)" });
    expect(span).toHaveStyle({ fontWeight: "700" });
    expect(span).toHaveStyle({ textDecoration: "underline" });
  });

  it("falls back to the default foreground color", () => {
    const { container } = render(<TerminalScreen screen={screenOf(["x"])} />);
    expect(C.fg).toBe("#c0caf5");
    expect(container.querySelector("span")).toHaveStyle({
      color: "rgb(192, 202, 245)",
    });
  });

  it("preserves whitespace in segments", () => {
    const { container } = render(
      <TerminalScreen screen={{ rows: [[{ t: "  spaced  " }]] }} />,
    );
    expect(container.textContent).toBe("  spaced  ");
    expect(container.querySelector("span")).toHaveStyle({ whiteSpace: "pre" });
  });

  it("appends an optional className", () => {
    const { container } = render(
      <TerminalScreen screen={{ rows: [] }} className="my-4" />,
    );
    expect(container.firstElementChild).toHaveClass("my-4");
  });
});

describe("TerminalWindow", () => {
  it("renders the title and the children", () => {
    render(
      <TerminalWindow title="demo">
        <p>body content</p>
      </TerminalWindow>,
    );
    expect(screen.getByText("demo")).toBeInTheDocument();
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("prefixes the title with the path glyph", () => {
    const { container } = render(<TerminalWindow title="keymap">x</TerminalWindow>);
    expect(container.textContent).toContain("~/keymap");
  });

  it("renders nothing extra when the optional right slot is omitted", () => {
    render(<TerminalWindow title="t">body</TerminalWindow>);
    expect(screen.queryByTestId("right-slot")).toBeNull();
  });

  it("renders the optional right slot when given", () => {
    render(
      <TerminalWindow title="t" right={<span data-testid="right-slot">R</span>}>
        body
      </TerminalWindow>,
    );
    expect(screen.getByTestId("right-slot")).toHaveTextContent("R");
  });

  it("appends an optional className to the frame", () => {
    const { container } = render(
      <TerminalWindow title="t" className="my-6">
        body
      </TerminalWindow>,
    );
    expect(container.firstElementChild).toHaveClass("my-6", "t-window");
  });

  it("renders an empty body", () => {
    render(<TerminalWindow title="empty">{null}</TerminalWindow>);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders the three window dots", () => {
    const { container } = render(<TerminalWindow title="t">x</TerminalWindow>);
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(3);
  });
});
