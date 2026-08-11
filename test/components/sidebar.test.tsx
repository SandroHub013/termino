import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/sidebar";
import { customSections, sections } from "@/lib/nav";

const usePathname = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
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

beforeEach(() => {
  usePathname.mockReturnValue("/");
});

describe("Sidebar", () => {
  it("renders a link for every documented component", () => {
    render(<Sidebar />);
    const expected =
      sections.reduce((n, s) => n + s.components.length, 0) +
      customSections.reduce((n, s) => n + s.components.length, 0);
    // + the repo link and the opentui docs link
    expect(screen.getAllByRole("link")).toHaveLength(expected + 2);
  });

  it("renders a heading per section", () => {
    render(<Sidebar />);
    for (const s of [...sections, ...customSections]) {
      expect(screen.getAllByText(s.label).length).toBeGreaterThan(0);
    }
  });

  it("routes opentui components under /docs/components", () => {
    const { container } = render(<Sidebar />);
    for (const section of sections) {
      for (const c of section.components) {
        const link = container.querySelector(`a[href="/docs/components/${c.slug}"]`);
        expect(link, c.slug).not.toBeNull();
        expect(link?.textContent).toContain(c.name);
      }
    }
  });

  it("routes custom components under /docs/custom and tags them", () => {
    render(<Sidebar />);
    const custom = customSections.flatMap((s) => s.components);
    expect(custom.length).toBeGreaterThan(0);
    expect(screen.getAllByText("termino")).toHaveLength(custom.length);
  });

  it("marks no entry active on an unrelated path", () => {
    usePathname.mockReturnValue("/");
    const { container } = render(<Sidebar />);
    expect(container.textContent).not.toContain("▸");
  });

  it("marks the entry matching the current path active", () => {
    const target = sections[0]?.components[0];
    expect(target).toBeDefined();
    usePathname.mockReturnValue(`/docs/components/${target!.slug}`);
    render(<Sidebar />);
    const link = screen.getByRole("link", { name: new RegExp(`▸\\s*${target!.name}`) });
    expect(link).toHaveClass("bg-ink-700");
    expect(link.textContent).toContain("▸");
  });

  it("marks exactly one entry active at a time", () => {
    const target = customSections.flatMap((s) => s.components)[0];
    expect(target).toBeDefined();
    usePathname.mockReturnValue(`/docs/custom/${target!.slug}`);
    const { container } = render(<Sidebar />);
    expect(container.textContent?.match(/▸/g)).toHaveLength(1);
  });

  it("KNOWN BUG: section labels collide across the two nav trees (see BUGS.md #3)", () => {
    // Sidebar keys its section <div>s by `section.label`, but the opentui and
    // custom trees both use "layout" and "input", so React sees duplicate keys.
    const labels = [...sections, ...customSections].map((s) => s.label);
    const duplicates = labels.filter((l, i) => labels.indexOf(l) !== i);
    expect(duplicates.length).toBeGreaterThan(0);
    expect(new Set(duplicates)).toEqual(new Set(["layout", "input"]));
  });

  it("renders the repository and opentui links", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: "GitHub repository" })).toHaveAttribute(
      "href",
      "https://github.com/SandroHub013/termino",
    );
    const docs = screen.getByRole("link", { name: /opentui docs/ });
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs.getAttribute("rel")).toContain("noreferrer");
  });
});
