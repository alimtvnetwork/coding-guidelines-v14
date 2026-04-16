import { saveCurrentState } from "./collapsibleState";

const MENU_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
const EXPAND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 15 12 20 17 15"/><polyline points="7 9 12 4 17 9"/></svg>`;

interface DropdownItemConfig {
  label: string;
  container: HTMLElement;
  isCollapsed: boolean;
  dropdown: HTMLElement;
  filePath?: string;
}

function toggleAllSections(container: HTMLElement, isCollapsed: boolean, filePath?: string): void {
  const method = isCollapsed ? "add" : "remove";
  container.querySelectorAll<HTMLElement>(".collapsible-section").forEach(s => s.classList[method]("collapsed"));

  if (filePath) {
    saveCurrentState(container, filePath);
  }
}

function createDropdownItem(config: DropdownItemConfig): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "h1-dropdown-item";
  btn.innerHTML = `${EXPAND_ICON}<span>${config.label}</span>`;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAllSections(config.container, config.isCollapsed, config.filePath);
    config.dropdown.style.display = "none";
  });

  return btn;
}

function createMenuButton(dropdown: HTMLElement): HTMLButtonElement {
  const menuBtn = document.createElement("button");
  menuBtn.className = "h1-actions-menu-btn";
  menuBtn.title = "Section actions";
  menuBtn.innerHTML = MENU_ICON;

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
  });

  return menuBtn;
}

function createDropdown(container: HTMLElement, filePath?: string): HTMLElement {
  const dropdown = document.createElement("div");
  dropdown.className = "h1-actions-dropdown";
  dropdown.style.display = "none";

  const expandItem = createDropdownItem({ label: "Expand all sections", container, isCollapsed: false, dropdown, filePath });
  const collapseItem = createDropdownItem({ label: "Collapse all sections", container, isCollapsed: true, dropdown, filePath });

  dropdown.appendChild(expandItem);
  dropdown.appendChild(collapseItem);

  return dropdown;
}

export function addH1ActionsMenu(h1: HTMLElement, container: HTMLElement, filePath?: string): void {
  const wrapper = document.createElement("div");
  wrapper.className = "h1-header-wrapper";
  h1.replaceWith(wrapper);
  wrapper.appendChild(h1);

  const dropdown = createDropdown(container, filePath);
  const menuBtn = createMenuButton(dropdown);

  document.addEventListener("click", (e) => {
    const isOutsideWrapper = !wrapper.contains(e.target as Node);

    if (isOutsideWrapper) {
      dropdown.style.display = "none";
    }
  });

  wrapper.appendChild(menuBtn);
  wrapper.appendChild(dropdown);
}
