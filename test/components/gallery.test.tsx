import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ComponentGallery, type GalleryGroup } from "@/components/gallery";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const groups: GalleryGroup[] = [
  {
    label: "layout",
    id: "layout",
    blurb: "Structural helpers",
    items: [
      { slug: "box", name: "Box", description: "Borders and flex layout", accent: "text-term-cyan" },
      { slug: "text", name: "Text", description: "Styled text output", accent: "text-term-blue" },
    ],
  },
  {
    label: "data",
    items: [
      {
        slug: "gauge",
        name: "Gauge",
        description: "Semicircle arc meter",
        accent: "text-term-green",
        badge: "termino",
      },
    ],
  },
];

const renderGallery = (props?: Partial<Parameters<typeof ComponentGallery>[0]>) =>
  render(
    <ComponentGallery groups={groups} basePath="/docs/components" {...props} />,
  );

describe("ComponentGallery", () => {
  it("renders every group and item", () => {
    renderGallery();
    expect(screen.getByText("layout")).toBeInTheDocument();
    expect(screen.getByText("data")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Box/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Text/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gauge/ })).toBeInTheDocument();
  });

  it("links each item under the base path", () => {
    renderGallery();
    expect(screen.getByRole("link", { name: /Box/ })).toHaveAttribute(
      "href",
      "/docs/components/box",
    );
  });

  it("respects a different base path", () => {
    renderGallery({ basePath: "/docs/custom" });
    expect(screen.getByRole("link", { name: /Gauge/ })).toHaveAttribute(
      "href",
      "/docs/custom/gauge",
    );
  });

  it("counts all items in the search placeholder", () => {
    renderGallery();
    expect(screen.getByPlaceholderText("Search 3 components…")).toBeInTheDocument();
  });

  it("renders the optional blurb only where present", () => {
    renderGallery();
    expect(screen.getByText("Structural helpers")).toBeInTheDocument();
  });

  it("renders the optional badge only where present", () => {
    renderGallery();
    expect(screen.getAllByText("termino")).toHaveLength(1);
  });

  it("renders an empty gallery without crashing", () => {
    render(<ComponentGallery groups={[]} basePath="/docs/components" />);
    expect(screen.getByPlaceholderText("Search 0 components…")).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("filters items by name", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "gau");
    expect(screen.getByRole("link", { name: /Gauge/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Box/ })).toBeNull();
  });

  it("filters items by description", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "semicircle");
    expect(screen.getByRole("link", { name: /Gauge/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Text/ })).toBeNull();
  });

  it("matches case-insensitively", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "BOX");
    expect(screen.getByRole("link", { name: /Box/ })).toBeInTheDocument();
  });

  it("drops groups left with no matches", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "gauge");
    expect(screen.queryByText("layout")).toBeNull();
    expect(screen.getByText("data")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "zzzz");
    expect(screen.getByText(/No components match/)).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("ignores surrounding whitespace in the query", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(screen.getByRole("link", { name: /Box/ })).toBeInTheDocument();
    expect(screen.queryByText(/No components match/)).toBeNull();
  });

  it("hides the clear button until there is a query, then resets on click", async () => {
    const user = userEvent.setup();
    renderGallery();
    expect(screen.queryByRole("button")).toBeNull();
    const input = screen.getByRole("textbox");
    await user.type(input, "zzzz");
    await user.click(screen.getByRole("button"));
    expect(input).toHaveValue("");
    expect(screen.getByRole("link", { name: /Box/ })).toBeInTheDocument();
  });

  it("applies the accent class to the section heading", () => {
    renderGallery({ accent: "text-term-magenta" });
    const heading = screen.getByText("layout").closest("h2");
    expect(heading?.querySelector(".text-term-magenta")).not.toBeNull();
  });

  it("falls back to the default accent", () => {
    renderGallery();
    const heading = screen.getByText("layout").closest("h2");
    expect(heading?.querySelector(".text-term-blue")).not.toBeNull();
  });
});
