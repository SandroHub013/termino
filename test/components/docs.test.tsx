import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KeyTable, PropsTable, type Prop } from "@/components/docs";

const props: Prop[] = [
  { name: "value", type: "number", default: "0", description: "Current value" },
  { name: "label", type: "string", default: "-", description: "Header text" },
];

describe("PropsTable", () => {
  it("renders the four column headers", () => {
    render(<PropsTable props={props} />);
    for (const header of ["prop", "type", "default", "description"]) {
      expect(screen.getByRole("columnheader", { name: header })).toBeInTheDocument();
    }
  });

  it("renders one body row per prop", () => {
    render(<PropsTable props={props} />);
    const body = screen.getAllByRole("rowgroup")[1];
    expect(body).toBeDefined();
    expect(within(body!).getAllByRole("row")).toHaveLength(2);
  });

  it("renders every field of a prop", () => {
    render(<PropsTable props={props} />);
    expect(screen.getByText("value")).toBeInTheDocument();
    expect(screen.getByText("number")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Current value")).toBeInTheDocument();
  });

  it("renders headers but no body rows for an empty prop list", () => {
    render(<PropsTable props={[]} />);
    expect(screen.getByRole("columnheader", { name: "prop" })).toBeInTheDocument();
    const body = screen.getAllByRole("rowgroup")[1];
    expect(within(body!).queryAllByRole("row")).toHaveLength(0);
  });

  it("renders the section caption", () => {
    render(<PropsTable props={[]} />);
    expect(screen.getByText("properties")).toBeInTheDocument();
  });

  it("renders a single prop", () => {
    render(<PropsTable props={[props[0]!]} />);
    const body = screen.getAllByRole("rowgroup")[1];
    expect(within(body!).getAllByRole("row")).toHaveLength(1);
  });

  it("keeps empty-string fields from breaking the row", () => {
    render(
      <PropsTable props={[{ name: "x", type: "", default: "", description: "" }]} />,
    );
    const body = screen.getAllByRole("rowgroup")[1];
    expect(within(body!).getAllByRole("row")).toHaveLength(1);
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});

describe("KeyTable", () => {
  it("renders each key and its action", () => {
    render(
      <KeyTable
        keys={[
          ["↑ / ↓", "Move selection"],
          ["enter", "Confirm"],
        ]}
      />,
    );
    expect(screen.getByText("↑ / ↓")).toBeInTheDocument();
    expect(screen.getByText("Move selection")).toBeInTheDocument();
    expect(screen.getByText("enter")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("renders inside a terminal window titled keymap", () => {
    const { container } = render(<KeyTable keys={[["k", "up"]]} />);
    expect(container.textContent).toContain("~/keymap");
  });

  it("renders an empty keymap without crashing", () => {
    const { container } = render(<KeyTable keys={[]} />);
    expect(container.textContent).toContain("keymap");
    expect(container.querySelectorAll(".contents")).toHaveLength(0);
  });

  it("renders one group per entry", () => {
    const { container } = render(
      <KeyTable keys={[["a", "one"], ["b", "two"], ["c", "three"]]} />,
    );
    expect(container.querySelectorAll(".contents")).toHaveLength(3);
  });

  it("handles the placeholder em-dash keymap used by display-only components", () => {
    render(<KeyTable keys={[["—", "Display only"]]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Display only")).toBeInTheDocument();
  });
});
