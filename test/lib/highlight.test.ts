import { describe, expect, it } from "vitest";
import { highlightTs } from "@/lib/highlight";

const KEYWORD = "#bb9af7";
const STRING = "#9ece6a";
const NUMBER = "#ff9e64";
const COMMENT = "#565f89";
const IDENT = "#c0caf5";
const ARROW = "#7dcfff";

const flat = (code: string) => highlightTs(code).flat();
const textOf = (code: string) =>
  highlightTs(code)
    .map((line) => line.map((t) => t.t).join(""))
    .join("\n");
const colorOf = (code: string, token: string) =>
  flat(code).find((t) => t.t === token)?.fg;

describe("highlightTs", () => {
  it("returns one token row per source line", () => {
    expect(highlightTs("a\nb\nc")).toHaveLength(3);
    expect(highlightTs("single")).toHaveLength(1);
    expect(highlightTs("")).toHaveLength(1);
  });

  it("emits no tokens for an empty line", () => {
    expect(highlightTs("")).toEqual([[]]);
    expect(highlightTs("a\n\nb")[1]).toEqual([]);
  });

  it("is lossless: concatenating tokens reproduces the source", () => {
    const samples = [
      "const x = 1;",
      "  indented('with spaces')  ",
      "// a comment\nexport function f(a: number): string { return `${a}`; }",
      "if (a === b) { return [1, 2, 3].map((n) => n * 2); }",
      "\tconst\ttabbed = 1",
      "const emoji = '🎉 done'",
    ];
    for (const src of samples) {
      expect(textOf(src)).toBe(src);
    }
  });

  it("colors keywords", () => {
    expect(colorOf("const x = 1", "const")).toBe(KEYWORD);
    expect(colorOf("export function f() {}", "export")).toBe(KEYWORD);
    expect(colorOf("export function f() {}", "function")).toBe(KEYWORD);
    expect(colorOf("return await p", "await")).toBe(KEYWORD);
  });

  it("colors plain identifiers differently from keywords", () => {
    expect(colorOf("const answer = 1", "answer")).toBe(IDENT);
    expect(colorOf("const answer = 1", "answer")).not.toBe(KEYWORD);
  });

  it("does not treat a keyword substring as a keyword", () => {
    expect(colorOf("constant = 1", "constant")).toBe(IDENT);
    expect(colorOf("myReturn = 1", "myReturn")).toBe(IDENT);
  });

  it("colors numbers, including decimals", () => {
    expect(colorOf("x = 42", "42")).toBe(NUMBER);
    expect(colorOf("x = 3.14", "3.14")).toBe(NUMBER);
  });

  it("colors all three string flavours", () => {
    expect(colorOf('x = "double"', '"double"')).toBe(STRING);
    expect(colorOf("x = 'single'", "'single'")).toBe(STRING);
    expect(colorOf("x = `tpl`", "`tpl`")).toBe(STRING);
  });

  it("handles escaped quotes inside strings", () => {
    expect(colorOf('x = "a\\"b"', '"a\\"b"')).toBe(STRING);
    expect(colorOf("x = 'a\\'b'", "'a\\'b'")).toBe(STRING);
  });

  it("colors line comments to end of line", () => {
    expect(colorOf("// hello world", "// hello world")).toBe(COMMENT);
    const tail = flat("const x = 1; // note").find((t) => t.t.startsWith("//"));
    expect(tail?.t).toBe("// note");
    expect(tail?.fg).toBe(COMMENT);
  });

  it("does not highlight keywords inside a comment", () => {
    const tokens = flat("// const function return");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.fg).toBe(COMMENT);
  });

  it("gives the arrow operator its own color", () => {
    expect(colorOf("const f = () => 1", "=>")).toBe(ARROW);
    expect(colorOf("const f = () => 1", "=>")).not.toBe(
      colorOf("const f = () => 1", "("),
    );
  });

  it("colors punctuation", () => {
    const brace = colorOf("{}", "{");
    expect(brace).toBe("#a9b1d6");
  });

  it("preserves leading whitespace as an uncolored token", () => {
    const first = highlightTs("    const x = 1")[0]?.[0];
    expect(first?.t).toBe("    ");
    expect(first?.fg).toBeUndefined();
  });

  it("is stateless across calls (global regex lastIndex is reset)", () => {
    const code = "const a = 1;\nconst b = 2;";
    expect(highlightTs(code)).toEqual(highlightTs(code));
    const first = highlightTs("const x = 1");
    const second = highlightTs("const x = 1");
    expect(second).toEqual(first);
  });

  it("handles lines that are pure punctuation or whitespace", () => {
    expect(textOf("   ")).toBe("   ");
    expect(textOf("}")).toBe("}");
    expect(highlightTs("}")[0]).toHaveLength(1);
  });

  it("handles a long realistic snippet without dropping characters", () => {
    const src = [
      "import { useState } from 'react';",
      "",
      "/* not a line comment */",
      "export interface Props { n: number }",
      "",
      "export function Counter({ n }: Props) {",
      "  const [count, setCount] = useState(n); // start",
      "  return <button onClick={() => setCount(count + 1)}>{count}</button>;",
      "}",
    ].join("\n");
    expect(textOf(src)).toBe(src);
    expect(highlightTs(src)).toHaveLength(9);
  });
});
