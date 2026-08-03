const KEYWORDS =
  /^(import|from|export|const|let|var|function|return|if|else|for|while|new|async|await|class|interface|type|extends|implements|switch|case|break|default|try|catch|throw|in|of|typeof|void|static|readonly|public|private)$/;

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)|(=>|->|===|!==|==|!=|<=|>=|\?|:|[{}()[\],.;=+\-*/%<>!&|^~])/g;

export interface HToken {
  t: string;
  fg?: string;
  b?: boolean;
}

export function highlightTs(code: string): HToken[][] {
  const lines = code.split("\n");
  return lines.map((line) => {
    const tokens: HToken[] = [];
    let last = 0;
    TOKEN_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TOKEN_RE.exec(line)) !== null) {
      if (m.index > last) tokens.push({ t: line.slice(last, m.index) });
      const [full, comment, s1, s2, s3, num, ident, punct] = m;
      if (comment !== undefined) tokens.push({ t: full, fg: "#565f89", b: false });
      else if (s1 !== undefined) tokens.push({ t: full, fg: "#9ece6a" });
      else if (s2 !== undefined) tokens.push({ t: full, fg: "#9ece6a" });
      else if (s3 !== undefined) tokens.push({ t: full, fg: "#9ece6a" });
      else if (num !== undefined) tokens.push({ t: full, fg: "#ff9e64" });
      else if (ident !== undefined) {
        if (KEYWORDS.test(ident)) tokens.push({ t: full, fg: "#bb9af7" });
        else tokens.push({ t: full, fg: "#c0caf5" });
      } else if (punct !== undefined) {
        if (punct === "=>") tokens.push({ t: full, fg: "#7dcfff", b: false });
        else tokens.push({ t: full, fg: "#a9b1d6" });
      }
      last = m.index + full.length;
    }
    if (last < line.length) tokens.push({ t: line.slice(last) });
    return tokens;
  });
}
