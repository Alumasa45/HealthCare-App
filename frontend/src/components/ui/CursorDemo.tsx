import React from "react";
import CursorToggle from "@/components/ui/CursorToggle";

export const CursorDemo: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        💜 Purple Snowflake Cursor Effect
      </h3>
      <p className="text-gray-600 mb-4">
        Move your mouse around to see beautiful purple snowflakes trail behind
        your cursor! This creates an elegant winter effect that matches your
        purple theme.
      </p>

      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 mb-4">
        <p className="text-center text-purple-600 text-sm">
          ✨ Move your mouse here to see the purple snowflake effect ✨
        </p>
      </div>

      <CursorToggle className="mt-4" />

      <div className="mt-4 text-xs text-gray-500">
        <p>
          • The effect respects your system's "prefers-reduced-motion" setting
        </p>
        <p>• Your preference is saved locally and persists between sessions</p>
        <p>• The purple snowflakes fade out naturally as they fall</p>
        <p>• Multiple shades of purple are used for visual variety</p>
      </div>
    </div>
  );
};

export default CursorDemo;
