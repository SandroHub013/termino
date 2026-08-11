import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GitHubIcon, GitHubLink } from "@/components/github-link";

describe("GitHubIcon", () => {
  it("renders an svg at the default size", () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "15");
    expect(svg).toHaveAttribute("height", "15");
  });

  it("honours an explicit size", () => {
    const { container } = render(<GitHubIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("is hidden from assistive tech and draws a path", () => {
    const { container } = render(<GitHubIcon />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("path")).not.toBeNull();
  });
});

describe("GitHubLink", () => {
  it("links to the repository", () => {
    render(<GitHubLink />);
    expect(screen.getByRole("link", { name: "GitHub repository" })).toHaveAttribute(
      "href",
      "https://github.com/SandroHub013/termino",
    );
  });

  it("opens in a new tab with a safe rel", () => {
    render(<GitHubLink />);
    const link = screen.getByRole("link", { name: "GitHub repository" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("labels itself for assistive tech instead of using visible text", () => {
    render(<GitHubLink />);
    const link = screen.getByRole("link", { name: "GitHub repository" });
    expect(link).toHaveAttribute("title", "GitHub repository");
    expect(link.textContent).toBe("");
  });

  it("appends an optional className without dropping the base classes", () => {
    render(<GitHubLink className="w-8 h-8" />);
    const link = screen.getByRole("link", { name: "GitHub repository" });
    expect(link).toHaveClass("w-8", "h-8", "t-btn");
  });

  it("works with no props at all", () => {
    const { container } = render(<GitHubLink />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "15");
  });

  it("forwards the size to the icon", () => {
    const { container } = render(<GitHubLink size={24} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
  });
});
