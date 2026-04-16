import { useState, useEffect, useRef } from "react";

const HEADING_SELECTOR = "h1, h2, h3, h4";
const OBSERVER_ROOT_MARGIN = "0px 0px -70% 0px";
const ID_CLEAN_PATTERN = /[^a-z0-9]+/g;
const ID_TRIM_PATTERN = /(^-|-$)/g;

function normalizeToId(text: string): string {
  return text.toLowerCase().replace(ID_CLEAN_PATTERN, "-").replace(ID_TRIM_PATTERN, "");
}

function buildHeadingMap(root: HTMLElement): Map<Element, string> {
  const map = new Map<Element, string>();
  const headings = root.querySelectorAll(HEADING_SELECTOR);
  headings.forEach((h) => map.set(h, normalizeToId(h.textContent || "")));

  return map;
}

function findTopVisibleId(entries: IntersectionObserverEntry[], headingMap: Map<Element, string>): string | undefined {
  const visible = entries
    .filter((e) => e.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

  const topEntry = visible[0];

  if (!topEntry) return undefined;

  return headingMap.get(topEntry.target);
}

interface ObserverConfig {
  root: HTMLElement;
  headingMap: Map<Element, string>;
  onActivate: (id: string | undefined) => void;
}

function createHeadingObserver(config: ObserverConfig): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      const id = findTopVisibleId(entries, config.headingMap);

      if (id) config.onActivate(id);
    },
    { root: config.root, rootMargin: OBSERVER_ROOT_MARGIN, threshold: 0 }
  );

  config.root.querySelectorAll(HEADING_SELECTOR).forEach((h) => observer.observe(h));

  return observer;
}

export function useScrollSpy(
  scrollContainer: React.RefObject<HTMLElement>,
  content: string | undefined
): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    const root = scrollContainer.current;

    if (!root || !content) {
      setActiveId(undefined);

      return;
    }

    const headingMap = buildHeadingMap(root);

    if (headingMap.size === 0) return;

    const observer = createHeadingObserver({ root, headingMap, onActivate: setActiveId });

    return () => observer.disconnect();
  }, [content]);

  return activeId;
}
