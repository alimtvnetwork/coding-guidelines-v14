import { HtmlTag } from "@/constants/htmlTags";
import { saveCurrentState, restoreSavedState, hasCollapsedState } from "./collapsibleState";
import { addH1ActionsMenu } from "./h1ActionsMenu";
import { createCopyButton, createDownloadButton } from "./sectionActions";

interface SectionGroup {
  heading: HTMLElement;
  nodes: Node[];
}

interface SectionHeaderConfig {
  group: SectionGroup;
  section: HTMLElement;
  container: HTMLElement;
  filePath?: string;
}

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

function pushCurrentGroup(groups: SectionGroup[], current: SectionGroup | null): void {
  if (!current) {
    return;
  }

  groups.push(current);
}

function groupChildrenByH2(children: Node[]): { groups: SectionGroup[]; beforeFirst: Node[] } {
  const groups: SectionGroup[] = [];
  let current: SectionGroup | null = null;
  const beforeFirst: Node[] = [];

  for (const child of children) {
    const isH2 = child instanceof HTMLElement && child.tagName === HtmlTag.H2;

    if (isH2) {
      pushCurrentGroup(groups, current);
      current = { heading: child as HTMLElement, nodes: [] };
    } else if (current) {
      current.nodes.push(child);
    } else {
      beforeFirst.push(child);
    }
  }

  pushCurrentGroup(groups, current);

  return { groups, beforeFirst };
}

function appendBeforeFirstNodes(container: HTMLElement, beforeFirst: Node[], filePath?: string): void {
  beforeFirst.forEach((n) => {
    container.appendChild(n);
    const isH1 = n instanceof HTMLElement && n.tagName === HtmlTag.H1;

    if (isH1) {
      addH1ActionsMenu(n as HTMLElement, container, filePath);
    }
  });
}

function buildActionsGroup(section: HTMLElement, headingText: string): HTMLElement {
  const actionsGroup = document.createElement("div");
  actionsGroup.className = "section-actions-group";
  actionsGroup.appendChild(createCopyButton(section, headingText));
  actionsGroup.appendChild(createDownloadButton(section, headingText));

  return actionsGroup;
}

function attachHeaderClick(header: HTMLElement, section: HTMLElement, config: SectionHeaderConfig): void {
  header.addEventListener("click", (e) => {
    const isActionBtn = (e.target as HTMLElement).closest(".section-action-btn");

    if (isActionBtn) {
      return;
    }

    section.classList.toggle("collapsed");

    if (config.filePath) {
      saveCurrentState(config.container, config.filePath);
    }
  });
}

function createSectionHeader(config: SectionHeaderConfig): HTMLElement {
  const header = document.createElement("div");
  header.className = "collapsible-header";

  const chevron = document.createElement("span");
  chevron.className = "collapsible-chevron";
  chevron.innerHTML = CHEVRON_SVG;

  const headingText = config.group.heading.textContent?.trim() || "section";

  header.appendChild(chevron);
  header.appendChild(config.group.heading);
  header.appendChild(buildActionsGroup(config.section, headingText));
  attachHeaderClick(header, config.section, config);

  return header;
}

function createSectionBody(nodes: Node[]): HTMLElement {
  const body = document.createElement("div");
  body.className = "collapsible-body";
  const bodyInner = document.createElement("div");
  bodyInner.className = "collapsible-body-inner";
  nodes.forEach((n) => bodyInner.appendChild(n));
  body.appendChild(bodyInner);

  return body;
}

function buildSectionElement(group: SectionGroup, container: HTMLElement, filePath?: string): HTMLElement {
  const section = document.createElement("div");
  section.className = "collapsible-section";

  const config: SectionHeaderConfig = { group, section, container, filePath };
  section.appendChild(createSectionHeader(config));
  section.appendChild(createSectionBody(group.nodes));

  return section;
}

export function wrapSections(container: HTMLElement, filePath?: string): void {
  const children = Array.from(container.childNodes);
  const { groups, beforeFirst } = groupChildrenByH2(children);

  if (groups.length === 0) {
    return;
  }

  container.innerHTML = "";
  appendBeforeFirstNodes(container, beforeFirst, filePath);

  for (const group of groups) {
    const section = buildSectionElement(group, container, filePath);
    container.appendChild(section);
  }

  if (filePath && hasCollapsedState(filePath)) {
    restoreSavedState(container, filePath);
  }
}
