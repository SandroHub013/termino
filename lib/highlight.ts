const KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "new", "async", "await", "class", "interface",
  "type", "extends", "implements", "switch", "case", "break", "default",
  "try", "catch", "throw", "in", "of", "typeof", "void", "static", "readonly",
  "public", "private",
]);

/**
 * A quoted run that cannot backtrack: unescaped characters are consumed
 * greedily, and an escape only ever restarts that run. The obvious
 * `(?:[^"\\]|\\.)*` form matches the same strings but takes exponential time
 * to fail on a long unterminated one.
 */
const quoted = (q: string) => String.raw`${q}[^${q}\\]*(?:\\.[^${q}\\]*)*${q}`;

const PATTERNS = {
  comment: String.raw`\/\/.*$`,
  doubleQuoted: quoted('"'),
  singleQuoted: quoted("'"),
  templated: quoted("`"),
  number: String.raw`\b\d+(?:\.\d+)?\b`,
  identifier: String.raw`[A-Za-z_$][\w$]*`,
  punctuation: String.raw`=>|->|===|!==|==|!=|<=|>=|\?|:|[{}()[\],.;=+\-*/%<>!&|^~]`,
};

/** Index into `PATTERNS`, in the order the groups appear in `TOKEN_RE`. */
const KINDS = Object.keys(PATTERNS) as (keyof typeof PATTERNS)[];

const TOKEN_RE = new RegExp(KINDS.map((k) => `(${PATTERNS[k]})`).join("|"), "g");

const FG = {
  comment: "#565f89",
  string: "#9ece6a",
  number: "#ff9e64",
  keyword: "#bb9af7",
  identifier: "#c0caf5",
  arrow: "#7dcfff",
  punctuation: "#a9b1d6",
};

export interface HToken {
  t: string;
  fg?: string;
  b?: boolean;
}

function styleToken(kind: (typeof KINDS)[number], t: string): HToken {
  switch (kind) {
    case "comment":
      return { t, fg: FG.comment, b: false };
    case "doubleQuoted":
    case "singleQuoted":
    case "templated":
      return { t, fg: FG.string };
    case "number":
      return { t, fg: FG.number };
    case "identifier":
      return { t, fg: KEYWORDS.has(t) ? FG.keyword : FG.identifier };
    default:
      return t === "=>" ? { t, fg: FG.arrow, b: false } : { t, fg: FG.punctuation };
  }
}

function highlightLine(line: string): HToken[] {
  const tokens: HToken[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;

  for (let m = TOKEN_RE.exec(line); m !== null; m = TOKEN_RE.exec(line)) {
    if (m.index > last) tokens.push({ t: line.slice(last, m.index) });
    const kind = KINDS[m.slice(1).findIndex((group) => group !== undefined)];
    if (kind) tokens.push(styleToken(kind, m[0]));
    last = m.index + m[0].length;
  }

  if (last < line.length) tokens.push({ t: line.slice(last) });
  return tokens;
}

export function highlightTs(code: string): HToken[][] {
  return code.split("\n").map(highlightLine);
}
