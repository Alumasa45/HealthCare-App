import React from "react";
import { Sun, Moon, Palette } from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: {
    mode: ThemeMode;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      mode: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    {
      mode: "light-purple",
      label: "Light Purple",
      icon: <Palette className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      mode: "dark",
      label: "Dark",
      icon: <Moon className="h-4 w-4" />,
      color: "bg-gray-800 text-gray-100 border-gray-600",
    },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 border border-gray-200 dark:border-gray-700 light-purple:border-light-purple-200 rounded-lg shadow-sm">
        {themes.map((themeOption) => (
          <button
            key={themeOption.mode}
            onClick={() => setTheme(themeOption.mode)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                theme === themeOption.mode
                  ? themeOption.color + " shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 light-purple:text-purple-600 light-purple:hover:text-purple-800 light-purple:hover:bg-purple-50"
              }
            `}
            title={`Switch to ${themeOption.label} theme`}
          >
            {themeOption.icon}
            <span className="hidden sm:inline">{themeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
