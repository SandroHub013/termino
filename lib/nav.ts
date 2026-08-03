import { CATEGORIES, customComponents } from "./custom/meta";

export interface NavComponent {
  slug: string;
  name: string;
  description: string;
  accent: string;
}

export interface NavSection {
  label: string;
  path: string;
  components: NavComponent[];
}

export const sections: NavSection[] = [
  {
    label: "layout",
    path: "components",
    components: [
      {
        slug: "text",
        name: "Text",
        description: "Styled text, colors, attributes, selection",
        accent: "text-term-blue",
      },
      {
        slug: "box",
        name: "Box",
        description: "Borders, titles, flex layout container",
        accent: "text-term-cyan",
      },
      {
        slug: "scrollbox",
        name: "ScrollBox",
        description: "Scrollable viewport with sticky scroll",
        accent: "text-term-teal",
      },
      {
        slug: "ascii-font",
        name: "ASCIIFont",
        description: "Large ASCII art text",
        accent: "text-term-magenta",
      },
    ],
  },
  {
    label: "input",
    path: "components",
    components: [
      {
        slug: "input",
        name: "Input",
        description: "Text field with cursor and focus states",
        accent: "text-term-green",
      },
      {
        slug: "select",
        name: "Select",
        description: "Keyboard-navigable option list",
        accent: "text-term-yellow",
      },
      {
        slug: "tab-select",
        name: "TabSelect",
        description: "Horizontal tab selection with scroll",
        accent: "text-term-red",
      },
    ],
  },
  {
    label: "code",
    path: "components",
    components: [
      {
        slug: "code",
        name: "Code",
        description: "Tree-sitter syntax highlighting",
        accent: "text-term-blue",
      },
      {
        slug: "diff",
        name: "Diff",
        description: "Unified and split diff viewer",
        accent: "text-term-green",
      },
    ],
  },
  {
    label: "data",
    path: "components",
    components: [
      {
        slug: "text-table",
        name: "TextTable",
        description: "Tabular data with borders",
        accent: "text-term-cyan",
      },
      {
        slug: "slider",
        name: "Slider",
        description: "Value picking with drag or keys",
        accent: "text-term-yellow",
      },
    ],
  },
];

export const allComponents = sections.flatMap((s) => s.components);

/** Custom (termino) components grouped by category — derived from lib/custom/meta. */
export const customSections: NavSection[] = CATEGORIES.map((cat) => ({
  label: cat.label,
  path: "custom",
  components: customComponents
    .filter((c) => c.group === cat.id)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      accent: c.accent,
    })),
}));
