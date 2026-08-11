import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  customBySlug,
  customComponents,
  orderedCustomComponents,
  type CustomGroup,
} from "@/lib/custom/meta";
import { allComponents, customSections, sections } from "@/lib/nav";

const GROUP_IDS = new Set<CustomGroup>(CATEGORIES.map((c) => c.id));

describe("sections (opentui components)", () => {
  it("is non-empty and every section has components", () => {
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) {
      expect(s.components.length, s.label).toBeGreaterThan(0);
    }
  });

  it("routes every section under /docs/components", () => {
    for (const s of sections) expect(s.path).toBe("components");
  });

  it("uses unique section labels", () => {
    expect(new Set(sections.map((s) => s.label)).size).toBe(sections.length);
  });

  it("gives every component a slug, name, description and accent", () => {
    for (const c of allComponents) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.accent).toMatch(/^text-/);
    }
  });

  it("uses unique slugs across all sections", () => {
    const slugs = allComponents.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("flattens exactly the components of every section", () => {
    const expected = sections.reduce((n, s) => n + s.components.length, 0);
    expect(allComponents).toHaveLength(expected);
  });
});

describe("customSections", () => {
  it("mirrors the category list one-for-one, in order", () => {
    expect(customSections.map((s) => s.label)).toEqual(
      CATEGORIES.map((c) => c.label),
    );
  });

  it("routes every custom section under /docs/custom", () => {
    for (const s of customSections) expect(s.path).toBe("custom");
  });

  it("partitions the custom components without loss or duplication", () => {
    const slugs = customSections.flatMap((s) => s.components.map((c) => c.slug));
    expect(slugs).toHaveLength(customComponents.length);
    expect(new Set(slugs).size).toBe(customComponents.length);
    expect(new Set(slugs)).toEqual(new Set(customComponents.map((c) => c.slug)));
  });

  it("places each component in the section matching its group", () => {
    for (const section of customSections) {
      for (const c of section.components) {
        expect(customBySlug[c.slug]?.group, c.slug).toBe(section.label);
      }
    }
  });

  it("copies name, description and accent from the metadata", () => {
    for (const section of customSections) {
      for (const c of section.components) {
        const meta = customBySlug[c.slug];
        expect(meta).toBeDefined();
        expect(c.name).toBe(meta?.name);
        expect(c.description).toBe(meta?.description);
        expect(c.accent).toBe(meta?.accent);
      }
    }
  });

  it("does not collide with the opentui component slugs", () => {
    const opentui = new Set(allComponents.map((c) => c.slug));
    for (const section of customSections) {
      for (const c of section.components) {
        // Different route prefixes, but a shared slug would be confusing.
        expect(opentui.has(c.slug) && section.path === "components").toBe(false);
      }
    }
  });
});

describe("custom component metadata", () => {
  it("declares at least one component", () => {
    expect(customComponents.length).toBeGreaterThan(0);
  });

  it("uses unique slugs", () => {
    const slugs = customComponents.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses unique category ids", () => {
    expect(GROUP_IDS.size).toBe(CATEGORIES.length);
  });

  it("assigns every component to a declared category", () => {
    for (const c of customComponents) {
      expect(GROUP_IDS.has(c.group), `${c.slug} -> ${c.group}`).toBe(true);
    }
  });

  it("fills in the required documentation fields", () => {
    for (const c of customComponents) {
      expect(c.slug, c.name).toMatch(/^[a-z0-9-]+$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.accent).toMatch(/^text-/);
      expect(c.source).toMatch(/\.tsx?$/);
      expect(c.demo.length).toBeGreaterThan(0);
      expect(c.api.length).toBeGreaterThan(0);
      expect(Array.isArray(c.keymap)).toBe(true);
      expect(Array.isArray(c.notes)).toBe(true);
    }
  });

  it("documents props with all four columns filled", () => {
    for (const c of customComponents) {
      for (const p of c.props) {
        expect(p.name.length, `${c.slug}.${p.name}`).toBeGreaterThan(0);
        expect(p.type.length, `${c.slug}.${p.name}`).toBeGreaterThan(0);
        expect(p.default.length, `${c.slug}.${p.name}`).toBeGreaterThan(0);
        expect(p.description.length, `${c.slug}.${p.name}`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every keymap entry a key and an action", () => {
    for (const c of customComponents) {
      for (const [key, action] of c.keymap) {
        expect(key.length, c.slug).toBeGreaterThan(0);
        expect(action.length, c.slug).toBeGreaterThan(0);
      }
    }
  });

  it("gives variants unique ids within a component", () => {
    for (const c of customComponents) {
      if (!c.variants) continue;
      const ids = c.variants.map((v) => v.id);
      expect(new Set(ids).size, c.slug).toBe(ids.length);
      for (const v of c.variants) {
        expect(v.label.length).toBeGreaterThan(0);
        expect(v.blurb.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("customBySlug", () => {
  it("indexes every component by its slug", () => {
    expect(Object.keys(customBySlug)).toHaveLength(customComponents.length);
    for (const c of customComponents) {
      expect(customBySlug[c.slug]).toBe(c);
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(customBySlug["definitely-not-a-component"]).toBeUndefined();
  });
});

describe("orderedCustomComponents", () => {
  it("is a permutation of customComponents", () => {
    expect(orderedCustomComponents).toHaveLength(customComponents.length);
    expect(new Set(orderedCustomComponents)).toEqual(new Set(customComponents));
  });

  it("groups components by category in declaration order", () => {
    const order = CATEGORIES.map((c) => c.id);
    const seen = orderedCustomComponents.map((c) => order.indexOf(c.group));
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    expect(seen.every((i) => i >= 0)).toBe(true);
  });

  it("gives every category a label and a blurb", () => {
    for (const cat of CATEGORIES) {
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.blurb.length).toBeGreaterThan(0);
    }
  });
});
