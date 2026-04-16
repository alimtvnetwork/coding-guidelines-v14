/**
 * Extracts fenced code blocks from markdown, replacing them with placeholders.
 */
import { buildCodeBlockHtml } from "./codeBlockBuilder";
import type { ExtractionResult } from "./types";

const DEFAULT_FENCE = "```";

interface BlockState {
  isInBlock: boolean;
  blockLang: string;
  blockFence: string;
  blockLines: string[];
  blockId: number;
}

interface ExtractionContext {
  state: BlockState;
  result: string[];
  store: Record<string, string>;
}

function createInitialContext(): ExtractionContext {
  return {
    state: {
      isInBlock: false,
      blockLang: "",
      blockFence: DEFAULT_FENCE,
      blockLines: [],
      blockId: 0,
    },
    result: [],
    store: {},
  };
}

function isOpeningFence(trimmed: string): RegExpMatchArray | null {
  return trimmed.match(/^(`{3,})\s*([a-zA-Z0-9_+-]*)[=]?\s*$/);
}

function isClosingFence(trimmed: string, fence: string): boolean {
  return /^`{3,}\s*$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= fence.length;
}

function handleOpeningFence(state: BlockState, match: RegExpMatchArray): void {
  state.isInBlock = true;
  state.blockFence = match[1];
  state.blockLang = match[2].toLowerCase();
  state.blockLines = [];
}

function handleClosingFence(ctx: ExtractionContext): void {
  const { state } = ctx;
  const placeholder = `\x00CODEBLOCK_${state.blockId}\x00`;
  ctx.store[placeholder] = buildCodeBlockHtml(state.blockLines.join("\n"), state.blockLang, state.blockId);
  state.blockId += 1;
  ctx.result.push(placeholder);
  state.isInBlock = false;
  state.blockLang = "";
  state.blockFence = DEFAULT_FENCE;
  state.blockLines = [];
}

function processBlockLine(line: string, trimmed: string, ctx: ExtractionContext): void {

  if (isClosingFence(trimmed, ctx.state.blockFence)) {
    handleClosingFence(ctx);

    return;
  }

  ctx.state.blockLines.push(line);
}

function processNonBlockLine(line: string, trimmed: string, ctx: ExtractionContext): void {
  const openMatch = isOpeningFence(trimmed);

  if (openMatch) {
    handleOpeningFence(ctx.state, openMatch);

    return;
  }

  ctx.result.push(line);
}

function processLine(line: string, ctx: ExtractionContext): void {
  const trimmed = line.trim();

  if (ctx.state.isInBlock) {
    processBlockLine(line, trimmed, ctx);

    return;
  }

  processNonBlockLine(line, trimmed, ctx);
}

function appendUnclosedBlock(ctx: ExtractionContext): void {

  if (!ctx.state.isInBlock) return;

  ctx.result.push(`${ctx.state.blockFence}${ctx.state.blockLang}`);
  ctx.result.push(...ctx.state.blockLines);
}

export function extractCodeBlocks(md: string): ExtractionResult {
  const lines = md.split("\n");
  const ctx = createInitialContext();

  for (const line of lines) {
    processLine(line, ctx);
  }

  appendUnclosedBlock(ctx);

  return { text: ctx.result.join("\n"), store: ctx.store };
}
