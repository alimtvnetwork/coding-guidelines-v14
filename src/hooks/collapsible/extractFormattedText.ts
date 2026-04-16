import { HtmlTag } from "@/constants/htmlTags";

function formatTableRows(rows: NodeListOf<HTMLTableRowElement>, lines: string[]): void {
  rows.forEach((row, ri) => {
    const cells = Array.from(row.querySelectorAll("th, td")).map(c => c.textContent?.trim() || "");
    lines.push("| " + cells.join(" | ") + " |");

    if (ri === 0) {
      lines.push("| " + cells.map(() => "---").join(" | ") + " |");
    }
  });
}

function extractHeading(child: Element, level: number): string[] {
  const text = child.textContent?.trim() || "";

  return ["", `${"#".repeat(level)} ${text}`, ""];
}

function extractCodeBlock(child: Element): string[] {
  const codeEl = child.querySelector("code");
  const langEl = child.querySelector(".code-lang-badge");
  const lang = langEl?.textContent?.trim() || "";
  const code = codeEl?.textContent || "";

  return ["", "```" + lang, code.trimEnd(), "```", ""];
}

function extractPreBlock(child: Element): string[] {
  const code = child.querySelector("code")?.textContent || child.textContent || "";

  return ["", "```", code.trimEnd(), "```", ""];
}

function extractTable(child: Element): string[] {
  const lines: string[] = [];
  const rows = child.querySelectorAll("tr");
  formatTableRows(rows, lines);
  lines.push("");

  return lines;
}

function extractList(child: Element, tag: string): string[] {
  const lines: string[] = [];
  const items = child.querySelectorAll(":scope > li");
  items.forEach((li, i) => {
    const prefix = tag === HtmlTag.Ol ? `${i + 1}. ` : "- ";
    lines.push(prefix + (li.textContent?.trim() || ""));
  });
  lines.push("");

  return lines;
}

function extractDivOrParagraph(child: Element): string[] {
  const nestedTable = child.querySelector("table");

  if (nestedTable) {
    const lines: string[] = [];
    const rows = nestedTable.querySelectorAll("tr");
    formatTableRows(rows, lines);
    lines.push("");

    return lines;
  }

  const text = child.textContent?.trim();

  if (text) {
    return [text, ""];
  }

  return [];
}

const HEADING_LEVELS: Record<string, number> = {
  [HtmlTag.H3]: 3,
  [HtmlTag.H4]: 4,
  [HtmlTag.H5]: 5,
  [HtmlTag.H6]: 6,
};

function extractByTag(child: Element, tag: string): string[] | null {
  if (tag === HtmlTag.Pre) {
    return extractPreBlock(child);
  }

  if (tag === HtmlTag.Table) {
    return extractTable(child);
  }

  if (tag === HtmlTag.Ul || tag === HtmlTag.Ol) {
    return extractList(child, tag);
  }

  if (tag === HtmlTag.Blockquote) {
    return ["> " + (child.textContent?.trim() || "")];
  }

  if (tag === HtmlTag.Hr) {
    return ["---"];
  }

  if (tag === HtmlTag.P || tag === HtmlTag.Div) {
    return extractDivOrParagraph(child);
  }

  return null;
}

function extractChildLines(child: Element): string[] {
  const tag = child.tagName;
  const headingLevel = HEADING_LEVELS[tag];

  if (headingLevel) {
    return extractHeading(child, headingLevel);
  }

  if (child.classList.contains("code-block-wrapper")) {
    return extractCodeBlock(child);
  }

  const tagResult = extractByTag(child, tag);

  if (tagResult) {
    return tagResult;
  }

  const text = child.textContent?.trim();

  return text ? [text] : [];
}

/**
 * Extracts structured text from a rendered section, preserving headings,
 * code blocks, list structure, and table formatting.
 */
export function extractFormattedText(el: Element): string {
  const lines: string[] = [];

  for (const child of el.children) {
    lines.push(...extractChildLines(child));
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
