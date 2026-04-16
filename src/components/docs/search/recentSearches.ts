const RECENT_SEARCHES_KEY = "docs-recent-searches";
const MAX_RECENT = 8;

export function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecent(items: string[]): void {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

export function addRecent(query: string): void {
  const items = loadRecent().filter((q) => q !== query);
  items.unshift(query);
  saveRecent(items);
}
