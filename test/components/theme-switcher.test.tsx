import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "@/components/theme-switcher";

const THEME_NAMES = ["terminal", "skeuomorphism", "neomorphism", "maximalism"];

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSwitcher", () => {
  it("renders one button per theme", () => {
    render(<ThemeSwitcher />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
    for (const name of THEME_NAMES) {
      expect(screen.getByTitle(name)).toBeInTheDocument();
    }
  });

  it("marks the terminal theme active by default", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByTitle("terminal")).toHaveClass("text-term-cyan");
    expect(screen.getByTitle("neomorphism")).not.toHaveClass("text-term-cyan");
  });

  it("adopts the theme already set on the document", async () => {
    document.documentElement.setAttribute("data-theme", "neo");
    render(<ThemeSwitcher />);
    await waitFor(() =>
      expect(screen.getByTitle("neomorphism")).toHaveClass("text-term-cyan"),
    );
  });

  it("writes the chosen theme to the document element", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByTitle("maximalism"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("maxi");
  });

  it("persists the chosen theme to localStorage", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByTitle("skeuomorphism"));
    expect(localStorage.getItem("termino-theme")).toBe("skeuo");
  });

  it("moves the active marker to the clicked theme", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByTitle("neomorphism"));
    expect(screen.getByTitle("neomorphism")).toHaveClass("text-term-cyan");
    expect(screen.getByTitle("terminal")).not.toHaveClass("text-term-cyan");
  });

  it("still applies the theme when localStorage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByTitle("neomorphism"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("neo");
    expect(screen.getByTitle("neomorphism")).toHaveClass("text-term-cyan");
  });

  it("supports switching back and forth", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByTitle("maximalism"));
    await user.click(screen.getByTitle("terminal"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("term");
    expect(localStorage.getItem("termino-theme")).toBe("term");
  });

  it("renders a distinct glyph per theme", () => {
    render(<ThemeSwitcher />);
    const glyphs = screen.getAllByRole("button").map((b) => b.textContent);
    expect(new Set(glyphs).size).toBe(4);
  });
});
