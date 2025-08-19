import React from "react";
import { Snowflake, MousePointer } from "lucide-react";
import useCursorPreferences from "@/hooks/useCursorPreferences";

interface CursorToggleProps {
  className?: string;
}

export const CursorToggle: React.FC<CursorToggleProps> = ({
  className = "",
}) => {
  const { snowflakeEnabled, setSnowflakeEnabled } = useCursorPreferences();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        {snowflakeEnabled ? (
          <Snowflake className="h-4 w-4 text-purple-500" />
        ) : (
          <MousePointer className="h-4 w-4 text-gray-500" />
        )}
        <label
          htmlFor="snowflake-cursor"
          className="text-sm font-medium cursor-pointer"
        >
          Purple Snowflake Cursor
        </label>
      </div>
      <button
        id="snowflake-cursor"
        onClick={() => setSnowflakeEnabled(!snowflakeEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          snowflakeEnabled ? "bg-purple-600" : "bg-gray-200"
        }`}
        aria-label="Toggle snowflake cursor effect"
        role="switch"
        aria-checked={snowflakeEnabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            snowflakeEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default CursorToggle;
