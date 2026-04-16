export const ViewModeType = {
  Preview: "preview",
  Source: "source",
  Edit: "edit",
  Split: "split",
} as const;

export type ViewMode = (typeof ViewModeType)[keyof typeof ViewModeType];

export const ThemeType = {
  Dark: "dark",
  Light: "light",
} as const;

export type Theme = (typeof ThemeType)[keyof typeof ThemeType];

export const KeyboardKeyType = {
  Escape: "Escape",
  Enter: "Enter",
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  QuestionMark: "?",
  K: "k",
  C: "c",
  ShiftC: "C",
} as const;

export const SpecEntryType = {
  File: "file",
  Folder: "folder",
} as const;

export const FilterModeType = {
  All: "all",
  CodeRed: "code-red",
  Unchecked: "unchecked",
} as const;

export type FilterMode = (typeof FilterModeType)[keyof typeof FilterModeType];

export const LanguageFilterType = {
  All: "all",
  Go: "go",
  Php: "php",
  Typescript: "typescript",
  Csharp: "csharp",
} as const;

export type LanguageFilter = (typeof LanguageFilterType)[keyof typeof LanguageFilterType];
