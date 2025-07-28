import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "light-purple";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "healthcare-theme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("light-purple");

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedTheme && ["light", "dark", "light-purple"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark", "light-purple");

    // Add current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Apply theme-specific CSS variables
    applyThemeVariables(theme);
  }, [theme]);

  const applyThemeVariables = (currentTheme: ThemeMode) => {
    const root = document.documentElement;

    switch (currentTheme) {
      case "light":
        root.style.setProperty("--bg-primary", "#ffffff");
        root.style.setProperty("--bg-secondary", "#f9fafb");
        root.style.setProperty("--text-primary", "#111827");
        root.style.setProperty("--text-secondary", "#6b7280");
        root.style.setProperty("--border-color", "#e5e7eb");
        root.style.setProperty("--accent-color", "#8b5cf6");
        break;
      case "dark":
        root.style.setProperty("--bg-primary", "#1f2937");
        root.style.setProperty("--bg-secondary", "#111827");
        root.style.setProperty("--text-primary", "#f9fafb");
        root.style.setProperty("--text-secondary", "#d1d5db");
        root.style.setProperty("--border-color", "#374151");
        root.style.setProperty("--accent-color", "#a78bfa");
        break;
      case "light-purple":
        root.style.setProperty("--bg-primary", "#faf7ff");
        root.style.setProperty("--bg-secondary", "#f3ebff");
        root.style.setProperty("--text-primary", "#581c87");
        root.style.setProperty("--text-secondary", "#7c2cd6");
        root.style.setProperty("--border-color", "#e9d9ff");
        root.style.setProperty("--accent-color", "#9333ea");
        break;
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const themes: ThemeMode[] = ["light", "light-purple", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
