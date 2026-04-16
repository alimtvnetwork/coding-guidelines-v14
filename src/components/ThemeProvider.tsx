import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

const STORAGE_KEY = "docs-theme";
const THEME_LIGHT: Theme = "light";
const THEME_DARK: Theme = "dark";

function getInitialTheme(): Theme {

  if (typeof window === "undefined") return THEME_LIGHT;

  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;

  if (stored) return stored;

  const isDarkPreferred = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return isDarkPreferred ? THEME_DARK : THEME_LIGHT;
}

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove(THEME_LIGHT, THEME_DARK);
  root.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === THEME_LIGHT ? THEME_DARK : THEME_LIGHT));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
