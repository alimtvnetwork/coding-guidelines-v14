import { toast } from "sonner";

export async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) {
    toast.error("Nothing to copy", { description: "No content available." });
    throw new Error("No content available to copy.");
  }

  if (fallbackCopyText(text)) {
    toast.success("Copied to clipboard");

    return;
  }

  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    toast.error("Copy failed", { description: "Clipboard access is blocked in this environment. Try selecting the text manually." });
    throw new Error("Clipboard API unavailable and fallback copy failed.");
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Copy failed", { description: "Unable to access the clipboard. Try selecting the text manually." });
    throw new Error("Clipboard write failed.");
  }
}

function createHiddenTextarea(text: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  return textarea;
}

function restoreSelection(selection: Selection | null, previousRange: Range | null): void {
  if (!selection) {
    return;
  }

  selection.removeAllRanges();

  if (!previousRange) {
    return;
  }

  selection.addRange(previousRange);
}

function fallbackCopyText(text: string): boolean {
  const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const textarea = createHiddenTextarea(text);
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const isCopied = typeof document.execCommand === "function" && document.execCommand("copy");

  document.body.removeChild(textarea);
  restoreSelection(selection, previousRange);
  previousActiveElement?.focus();

  return isCopied;
}
