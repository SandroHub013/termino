import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Shell from "@/components/shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

describe("Shell", () => {
  it("renders its children in the main region", () => {
    render(
      <Shell>
        <p>page body</p>
      </Shell>,
    );
    const main = screen.getByRole("main");
    expect(main).toContainElement(screen.getByText("page body"));
  });

  it("renders the brand link to the home page", () => {
    const { container } = render(<Shell>x</Shell>);
    const brand = container.querySelector('header a[href="/"]');
    expect(brand).not.toBeNull();
    expect(brand?.textContent).toContain("termino");
  });

  it("renders the top-level navigation", () => {
    render(<Shell>x</Shell>);
    expect(screen.getByRole("link", { name: "components" })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(screen.getByRole("link", { name: "custom" })).toHaveAttribute(
      "href",
      "/docs/custom",
    );
  });

  it("opens the external docs link safely", () => {
    render(<Shell>x</Shell>);
    const docs = screen.getByRole("link", { name: /docs ↗/ });
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs.getAttribute("rel")).toContain("noopener");
    expect(docs.getAttribute("rel")).toContain("noreferrer");
  });

  it("mounts the sidebar and the theme switcher", () => {
    const { container } = render(<Shell>x</Shell>);
    expect(container.querySelector("aside")).not.toBeNull();
    expect(screen.getByTitle("terminal")).toBeInTheDocument();
  });

  it("renders an empty page body without crashing", () => {
    render(<Shell>{null}</Shell>);
    expect(screen.getByRole("main")).toBeEmptyDOMElement();
  });

  it("renders a banner header", () => {
    render(<Shell>x</Shell>);
    expect(screen.getByRole("banner")).toHaveClass("t-header");
  });
});
