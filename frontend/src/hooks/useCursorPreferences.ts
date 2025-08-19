import { useState, useEffect } from "react";

interface CursorPreferences {
  snowflakeEnabled: boolean;
  setSnowflakeEnabled: (enabled: boolean) => void;
}

export const useCursorPreferences = (): CursorPreferences => {
  const [snowflakeEnabled, setSnowflakeEnabled] = useState(() => {
    // Check localStorage for user preference, default to true
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snowflakeCursor");
      return stored ? JSON.parse(stored) : true;
    }
    return true;
  });

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem("snowflakeCursor", JSON.stringify(snowflakeEnabled));
    }
  }, [snowflakeEnabled]);

  return {
    snowflakeEnabled,
    setSnowflakeEnabled,
  };
};

export default useCursorPreferences;
