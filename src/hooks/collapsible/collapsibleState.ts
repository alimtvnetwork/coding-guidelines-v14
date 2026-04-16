/** Module-level map: filePath → Set of collapsed section indices */
const collapsedStateMap = new Map<string, Set<number>>();

export function hasCollapsedState(filePath: string): boolean {
  return collapsedStateMap.has(filePath);
}

export function saveCurrentState(container: HTMLElement, filePath: string): void {
  const sections = container.querySelectorAll<HTMLElement>(".collapsible-section");

  if (sections.length === 0) {
    return;
  }

  const collapsed = new Set<number>();
  sections.forEach((section, i) => {
    const isCollapsed = section.classList.contains("collapsed");

    if (isCollapsed) {
      collapsed.add(i);
    }
  });
  collapsedStateMap.set(filePath, collapsed);
}

export function restoreSavedState(container: HTMLElement, filePath: string): void {
  const saved = collapsedStateMap.get(filePath);

  if (!saved) {
    return;
  }

  const sections = container.querySelectorAll<HTMLElement>(".collapsible-section");
  sections.forEach((section, i) => {
    section.classList.toggle("collapsed", saved.has(i));
  });
}
